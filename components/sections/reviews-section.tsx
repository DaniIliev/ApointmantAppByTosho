import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Star } from "lucide-react"

const reviews = [
  {
    id: 1,
    author: "Jessica M.",
    rating: 5,
    date: "2 days ago",
    comment:
      "Amazing experience! Sarah did an incredible job with my balayage. The salon is beautiful and the staff is so friendly.",
    service: "Color Treatment",
  },
  {
    id: 2,
    author: "Robert T.",
    rating: 5,
    date: "1 week ago",
    comment: "Michael is a true professional. Best haircut I've had in years. Highly recommend!",
    service: "Haircut & Style",
  },
  {
    id: 3,
    author: "Amanda K.",
    rating: 4,
    date: "2 weeks ago",
    comment: "Great service and beautiful results. The only reason for 4 stars is the wait time, but it was worth it!",
    service: "Bridal Styling",
  },
]

export function ReviewsSection({ businessId }: { businessId: string }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-sans">Recent Reviews</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {reviews.map((review) => (
            <div key={review.id} className="border-b border-border last:border-0 pb-6 last:pb-0">
              <div className="flex items-start gap-4">
                <Avatar>
                  <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                    {review.author.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="font-semibold font-sans">{review.author}</p>
                      <p className="text-xs text-muted-foreground">{review.date}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: review.rating }).map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-primary text-primary" />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2 leading-relaxed">{review.comment}</p>
                  <p className="text-xs text-muted-foreground">Service: {review.service}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
