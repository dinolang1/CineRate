import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { Server as SocketIOServer } from "socket.io";
import bcrypt from "bcryptjs";
import { z } from "zod";
import multer from "multer";
import path from "path";
import fs from "fs";
import { storage } from "./storage";
import { insertUserSchema, loginSchema, insertReviewSchema } from "@shared/schema";

const TMDB_API_KEY = process.env.TMDB_API_KEY || "fa9a2fe11d08cc3192b607d71065712a";
const TMDB_BASE_URL = "https://api.themoviedb.org/3";

const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      const uploadPath = path.join(process.cwd(), 'uploads');
      if (!fs.existsSync(uploadPath)) {
        fs.mkdirSync(uploadPath, { recursive: true });
      }
      cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
  }),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

async function fetchFromTMDB(endpoint: string) {
  const response = await fetch(`${TMDB_BASE_URL}${endpoint}?api_key=${TMDB_API_KEY}`);
  if (!response.ok) {
    throw new Error('TMDB API error');
  }
  return response.json();
}

function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.session.userId) {
    return res.status(401).json({ message: "Authentication required" });
  }
  next();
}

export async function registerRoutes(app: Express): Promise<Server> {
  app.post("/api/auth/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      const existingUser = await storage.getUserByUsername(userData.username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }

      const existingEmail = await storage.getUserByEmail(userData.email);
      if (existingEmail) {
        return res.status(400).json({ message: "Email already exists" });
      }

      const hashedPassword = await bcrypt.hash(userData.password, 12);
      const userDataWithHashedPassword = {
        ...userData,
        password: hashedPassword
      };

      const user = await storage.createUser(userDataWithHashedPassword);
      
      req.session.userId = user.id;
      req.session.user = {
        id: user.id,
        username: user.username,
        email: user.email,
        profilePicture: user.profilePicture || undefined
      };

      res.json({ 
        id: user.id, 
        username: user.username, 
        email: user.email,
        profilePicture: user.profilePicture || undefined
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const loginData = loginSchema.parse(req.body);
      
      const user = await storage.getUserByUsername(loginData.username);
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const validPassword = await bcrypt.compare(loginData.password, user.password);
      if (!validPassword) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      req.session.userId = user.id;
      req.session.user = {
        id: user.id,
        username: user.username,
        email: user.email,
        profilePicture: user.profilePicture || undefined
      };

      res.json({ 
        id: user.id, 
        username: user.username, 
        email: user.email,
        profilePicture: user.profilePicture || undefined
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Could not log out" });
      }
      res.clearCookie('connect.sid');
      res.json({ message: "Logged out successfully" });
    });
  });

app.get('/api/auth/me', (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ message: "Not authenticated" });
  }
  
  res.json(req.session.user);
});

app.post("/api/upload/profile", requireAuth, upload.single('profileImage'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }
    
    const fileUrl = `/uploads/${req.file.filename}`;
    
    // Ažuriraj korisnikov profil u bazi podataka
    try {
      await storage.updateUserProfilePicture(req.session.userId, fileUrl);
      
      // Ažuriraj session podatke
      if (req.session.user) {
        req.session.user = {
          ...req.session.user,
          profilePicture: fileUrl
        };
      }
      
      res.json({ 
        message: "File uploaded successfully", 
        fileUrl,
        filename: req.file.filename 
      });
    } catch (dbError) {
      // Obriši uploadanu sliku ako je baza failala
      const filePath = path.join(process.cwd(), 'uploads', req.file.filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      throw dbError;
    }
  } catch (error) {
    res.status(500).json({ message: "Upload failed" });
  }
});

app.get("/uploads/:filename", (req, res) => {
  try {
    const filename = req.params.filename;
    const filePath = path.join(process.cwd(), 'uploads', filename);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: "File not found" });
    }
    
    res.sendFile(filePath);
  } catch (error) {
    res.status(500).json({ message: "Error serving file" });
  }
});

app.get("/api/download/:filename", (req, res) => {
  try {
    const filename = req.params.filename;
    const filePath = path.join(process.cwd(), 'uploads', filename);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: "File not found" });
    }
    
    res.download(filePath);
  } catch (error) {
    res.status(500).json({ message: "Download failed" });
  }
});

app.get("/api/movies", async (req, res) => {
    try {
      const { genre, search } = req.query;
      
      let movies;
      if (search) {
        movies = await storage.searchMovies(search as string);
      } else if (genre && genre !== "all") {
        movies = await storage.getMoviesByGenre(genre as string);
      } else {
        movies = await storage.getAllMovies();
      }
      
      res.json(movies);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/movies/:id", async (req, res) => {
    try {
      const movie = await storage.getMovie(req.params.id);
      if (!movie) {
        return res.status(404).json({ message: "Movie not found" });
      }
      res.json(movie);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/tmdb/popular", async (req, res) => {
    try {
      console.log('TMDB API Key:', TMDB_API_KEY ? 'Set' : 'Not set');
      const data = await fetchFromTMDB("/movie/popular");
      res.json(data);
    } catch (error) {
      console.error('TMDB API Error:', error);
      res.status(500).json({ message: "Failed to fetch popular movies from TMDB" });
    }
  });

  app.get("/api/tmdb/search/:query", async (req, res) => {
    try {
      const query = encodeURIComponent(req.params.query);
      const data = await fetchFromTMDB(`/search/movie?query=${query}`);
      res.json(data);
    } catch (error) {
      res.status(500).json({ message: "Failed to search movies from TMDB" });
    }
  });

  app.get("/api/reviews/user/:userId", async (req, res) => {
    try {
      const reviews = await storage.getReviewsByUser(req.params.userId);
      res.json(reviews);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/reviews/movie/:movieId", async (req, res) => {
    try {
      const reviews = await storage.getReviewsByMovie(req.params.movieId);
      res.json(reviews);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/reviews/user/:userId/movie/:movieId", async (req, res) => {
    try {
      const review = await storage.getUserReviewForMovie(req.params.userId, req.params.movieId);
      if (!review) {
        return res.status(404).json({ message: "Review not found" });
      }
      res.json(review);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/reviews", requireAuth, async (req, res) => {
    try {
      const reviewData = insertReviewSchema.parse(req.body);
      
      if (reviewData.userId !== req.session.userId) {
        return res.status(403).json({ message: "You can only create reviews for yourself" });
      }
      
      const existingReview = await storage.getUserReviewForMovie(reviewData.userId, reviewData.movieId);
      if (existingReview) {
        return res.status(400).json({ message: "You have already reviewed this movie" });
      }

      const review = await storage.createReview(reviewData);
      
      // Pošalji real-time notifikaciju
      const io = app.get('io');
      io.to(`movie-${reviewData.movieId}`).emit('review-added', {
        review,
        user: req.session.user
      });
      
      res.json(review);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.put("/api/reviews/:id", requireAuth, async (req, res) => {
    try {
      const updates = z.object({
        rating: z.number().int().min(1).max(50).optional(),
        reviewText: z.string().optional(),
      }).parse(req.body);

      const existingReview = await storage.getReview(req.params.id);
      if (!existingReview) {
        return res.status(404).json({ message: "Review not found" });
      }

      if (existingReview.userId !== req.session.userId) {
        return res.status(403).json({ message: "You can only update your own reviews" });
      }

      const review = await storage.updateReview(req.params.id, updates);
      res.json(review);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.delete("/api/reviews/:id", requireAuth, async (req, res) => {
    try {
      const existingReview = await storage.getReview(req.params.id);
      if (!existingReview) {
        return res.status(404).json({ message: "Review not found" });
      }

      if (existingReview.userId !== req.session.userId) {
        return res.status(403).json({ message: "You can only delete your own reviews" });
      }

      const success = await storage.deleteReview(req.params.id);
      if (!success) {
        return res.status(404).json({ message: "Review not found" });
      }
      res.json({ message: "Review deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  const httpServer = createServer(app);
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('join-movie', (movieId) => {
      socket.join(`movie-${movieId}`);
    });

    socket.on('new-review', (data) => {
      io.to(`movie-${data.movieId}`).emit('review-added', data);
    });

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
    });
  });

  // Dodaj io instancu u app za korištenje u rutama
  app.set('io', io);

  return httpServer;
}
