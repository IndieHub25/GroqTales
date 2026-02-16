import { Card, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart, MessageCircle } from "lucide-react";
import Image from "next/image";

interface StoryProps {
  title: string;
  excerpt: string;
  coverImage: string;
  likes: number;
  comments: number;
  isNFT: boolean;
  genre: string;
}

export function StoryCard({ story }: { story: StoryProps }) {
  return (
    <Card className="group overflow-hidden border-slate-800 bg-slate-950 hover:border-slate-600 transition-all duration-300 hover:shadow-2xl hover:shadow-violet-900/10">
      <div className="relative h-48 w-full overflow-hidden">
        <Image 
          src={story.coverImage} 
          alt={story.title} 
          fill 
          className="object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-2 right-2 flex gap-2">
          {story.isNFT && (
            <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 shadow-lg">
              Minted NFT
            </Badge>
          )}
          <Badge variant="secondary" className="bg-black/60 backdrop-blur text-white border-0">
            {story.genre}
          </Badge>
        </div>
      </div>
      
      <CardHeader className="p-4 pb-2">
        <h3 className="text-lg font-bold text-slate-100 line-clamp-1 group-hover:text-violet-400 transition-colors">
          {story.title}
        </h3>
        <p className="text-sm text-slate-400 line-clamp-2">
          {story.excerpt}
        </p>
      </CardHeader>
      
      <CardFooter className="p-4 pt-2 flex justify-between items-center text-slate-500 text-sm">
        <div className="flex gap-4">
          <span className="flex items-center gap-1 hover:text-pink-500 transition-colors cursor-pointer">
            <Heart className="w-4 h-4" /> {story.likes}
          </span>
          <span className="flex items-center gap-1 hover:text-blue-400 transition-colors cursor-pointer">
            <MessageCircle className="w-4 h-4" /> {story.comments}
          </span>
        </div>
        <span className="text-xs text-slate-600">2 days ago</span>
      </CardFooter>
    </Card>
  );
}