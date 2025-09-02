import React from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface StarRatingProps {
  rating: number;
  onRatingChange?: (rating: number) => void;
  readonly?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
  showValue?: boolean;
  allowHalfStars?: boolean;
}

export function StarRating({ 
  rating, 
  onRatingChange, 
  readonly = false, 
  size = "md",
  className,
  showValue = false,
  allowHalfStars = false
}: StarRatingProps) {
  const [hoverRating, setHoverRating] = React.useState(0);

  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6", 
    lg: "w-8 h-8"
  };

  const handleClick = (newRating: number) => {
    if (!readonly && onRatingChange) {
      onRatingChange(newRating);
    }
  };

  const handleMouseEnter = (newRating: number) => {
    if (!readonly) {
      setHoverRating(newRating);
    }
  };

  const handleMouseLeave = () => {
    if (!readonly) {
      setHoverRating(0);
    }
  };

  const getStarFillType = (starIndex: number, currentRating: number) => {
    if (starIndex <= currentRating) {
      return 'full';
    } else if (starIndex - 0.5 <= currentRating) {
      return 'half';
    }
    return 'empty';
  };

  const renderStar = (starIndex: number) => {
    const currentRating = hoverRating || rating;
    const fillType = getStarFillType(starIndex, currentRating);
    
    return (
      <div key={starIndex} className="relative">
        {allowHalfStars && !readonly ? (
          <>
            <button
              type="button"
              className={cn(
                sizeClasses[size],
                "absolute left-0 top-0 w-1/2 h-full z-10 transition-colors duration-200 hover:scale-110 cursor-pointer"
              )}
              onClick={() => handleClick(starIndex - 0.5)}
              onMouseEnter={() => handleMouseEnter(starIndex - 0.5)}
              onMouseLeave={handleMouseLeave}
            />
            <button
              type="button"
              className={cn(
                sizeClasses[size],
                "absolute right-0 top-0 w-1/2 h-full z-10 transition-colors duration-200 hover:scale-110 cursor-pointer"
              )}
              onClick={() => handleClick(starIndex)}
              onMouseEnter={() => handleMouseEnter(starIndex)}
              onMouseLeave={handleMouseLeave}
            />
          </>
        ) : (
          <button
            type="button"
            disabled={readonly}
            className={cn(
              sizeClasses[size],
              "transition-colors duration-200",
              !readonly && "hover:scale-110 cursor-pointer",
              readonly && "cursor-default"
            )}
            onClick={() => handleClick(starIndex)}
            onMouseEnter={() => handleMouseEnter(starIndex)}
            onMouseLeave={handleMouseLeave}
          />
        )}
        
        {/* Star background (empty) */}
        <Star 
          className={cn(
            sizeClasses[size],
            "text-gray-600"
          )} 
        />
        
        {/* Star fill */}
        {fillType === 'full' && (
          <Star 
            className={cn(
              sizeClasses[size],
              "absolute top-0 left-0 text-yellow-400 fill-current"
            )} 
          />
        )}
        
        {fillType === 'half' && (
          <div className="absolute top-0 left-0 overflow-hidden" style={{ width: '50%' }}>
            <Star 
              className={cn(
                sizeClasses[size],
                "text-yellow-400 fill-current"
              )} 
            />
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={cn("flex items-center gap-1", className)}>
      <div className="flex gap-1 star-rating relative">
        {[1, 2, 3, 4, 5].map((star) => renderStar(star))}
      </div>
      {showValue && (
        <span className="ml-2 text-sm text-gray-400">
          {rating > 0 ? rating.toFixed(1) : "0"}
        </span>
      )}
    </div>
  );
}
