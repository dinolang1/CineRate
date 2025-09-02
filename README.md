# CineRate - Cinema Rating Application

### Frontend
- **React 18** s TypeScript-om za type-safe razvoj
- **Tailwind CSS** za responsive dizajn s custom cinema temom
- **shadcn/ui** komponente bazirane na Radix UI primitivima
- **React Hook Form** s Zod validacijom za sigurno rukovanje formama
- **TanStack Query** za upravljanje server stanjem i cache-iranje
- **Wouter** za client-side routing
- **Vite** kao build alat za optimizaciju

### Backend
- **Node.js** s Express.js frameworkom
- **TypeScript** s ES modulima
- **Drizzle ORM** za type-safe database operacije
- **PostgreSQL** kao glavna baza podataka
- **bcryptjs** za sigurnost lozinki
- **express-session** za session management
- **Socket.io** za real-time komunikaciju
- **Multer** za file upload/download
- **TMDB API** integracija za vanjski sadržaj

### Struktura baze podataka
- **Users**: Korisnici s podacima o username, email, lozinka
- **Movies**: Filmovi s metapodacima, posterima, trailerima
- **Reviews**: Korisničke recenzije s ocjenama (1-50 skala interno, 0.5-5.0 prikaz)

## Funkcionalnosti

### Autentifikacija
- Registracija i prijava korisnika
- Session management s localStorage perzistencijom
- "Remember me" funkcionalnost
- Sigurno hashiranje lozinki

### Filmovi
- Pretraživanje filmova po nazivu
- Filtriranje po žanrovima
- Sortiranje po različitim kriterijima (godina, ocjena, alfabetski)
- Detaljni prikaz filmova s trailerima
- Agregiran rating sustav
- **TMDB API integracija** za dodatne movie podatke
- **Real-time** ažuriranje kada se dodaju nove recenzije

### Recenzije
- Ocjenjivanje filmova s half-star podrškom (0.5-5.0)
- Pisanje detaljnih recenzija
- Uređivanje i brisanje vlastitih recenzija
- Prikaz svih korisničkih recenzija na profilu
- **Real-time notifikacije** za nove recenzije

### Upload/Download
- **Upload profile slika** pomoću multer middleware
- **Download funkcionalnost** za datoteke
- Sigurna pohrana uploaded datoteka

### Real-time funkcionalnosti
- **Socket.io** integracija za live komunikaciju
- **Live notifikacije** kada netko ostavi recenziju na filmu
- **Automatsko ažuriranje** stranica bez refresh-a


**Pokretanje:**
1. Otvorite terminal u root direktoriju
2. Pokrenite: `npm install`
3. Pokrenite: `npm run dev`
4. Otvorite: `http://localhost:5000`

