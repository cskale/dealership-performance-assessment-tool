import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { HelpCircle, MessageSquare } from "lucide-react";
import { Question } from "@/data/questionnaire";

interface QuestionCardProps {
  question: Question;
  value?: number;
  onChange: (value: number) => void;
}

export function QuestionCard({ question, value, onChange }: QuestionCardProps) {
  const [showNotes, setShowNotes] = useState(false);
  const [notes, setNotes] = useState("");

  const handleRatingClick = (rating: number) => {
    onChange(rating);
  };

  const getRatingColor = (rating: number) => {
    if (rating <= 2) return "bg-red-500 hover:bg-red-600";
    if (rating === 3) return "bg-yellow-500 hover:bg-yellow-600";
    return "bg-green-500 hover:bg-green-600";
  };

  const getRatingText = (rating: number) => {
    if (!question.scale) return "";
    return question.scale.labels[rating - 1] || "";
  };

  return (
    <div className="space-y-6">
      {/* Question Header */}
      <div className="space-y-3">
        <div className="flex items-start gap-3">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 leading-relaxed">
              {question.text}
            </h3>
            {question.description && (
              <p className="text-gray-600 mt-2 text-sm leading-relaxed">
                {question.description}
              </p>
            )}
          </div>
          <Badge variant="outline" className="text-xs">
            {question.category}
          </Badge>
        </div>
      </div>

      {/* Rating Scale */}
      {question.type === "scale" && question.scale && (
        <div className="space-y-4">
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-4">
              Rate from {question.scale.min} (lowest) to {question.scale.max} (highest)
            </p>
          </div>

          {/* Rating Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
            {Array.from({ length: question.scale.max }, (_, i) => {
              const rating = i + 1;
              const isSelected = value === rating;
              const label = getRatingText(rating);

              return (
                <Button
                  key={rating}
                  variant={isSelected ? "default" : "outline"}
                  onClick={() => handleRatingClick(rating)}
                  className={`h-auto p-4 flex flex-col items-center gap-2 transition-all duration-200 ${
                    isSelected ? getRatingColor(rating) : "hover:bg-gray-50"
                  }`}
                >
                  <span className="text-2xl font-bold">{rating}</span>
                  <span className="text-xs text-center leading-tight">
                    {label}
                  </span>
                </Button>
              );
            })}
          </div>

          {/* Selected Value Display */}
          {value && (
            <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-800">
                <strong>Selected:</strong> {value} - {getRatingText(value)}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Additional Features */}
      <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowNotes(!showNotes)}
          className="flex items-center gap-2"
        >
          <MessageSquare className="h-4 w-4" />
          {showNotes ? "Hide Notes" : "Add Notes"}
        </Button>

        <div className="flex items-center gap-2 text-xs text-gray-500">
          <HelpCircle className="h-4 w-4" />
          <span>Question weight: {question.weight}x</span>
        </div>
      </div>

      {/* Notes Section */}
      {showNotes && (
        <Card className="border-blue-200">
          <CardContent className="p-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Additional Notes (Optional)
            </label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any additional context or comments about this question..."
              rows={3}
              className="w-full"
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}