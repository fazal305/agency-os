"use client";

import { useState, useTransition } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RatingField } from "@/components/rating-field";
import { submitFeedback } from "./actions";

export function FeedbackForm() {
  const [wantsTestimonial, setWantsTestimonial] = useState(false);
  const [error, setError] = useState(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(formData) {
    setError(null);
    startTransition(async () => {
      const result = await submitFeedback(formData);
      if (result?.error) setError(result.error);
    });
  }

  return (
    <form action={handleSubmit} className="max-w-lg space-y-5">
      <RatingField name="communication_rating" label="Communication quality" />
      <RatingField name="quality_rating" label="Project quality" />
      <RatingField name="timeline_rating" label="Timeline" />
      <RatingField name="overall_rating" label="Overall satisfaction" />

      <div className="space-y-2">
        <Label htmlFor="improvement_notes">What could we improve?</Label>
        <Textarea id="improvement_notes" name="improvement_notes" rows={3} />
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          name="wants_testimonial"
          checked={wantsTestimonial}
          onChange={(e) => setWantsTestimonial(e.target.checked)}
          className="size-4 rounded border-border"
        />
        I&rsquo;d be willing to provide a testimonial
      </label>

      {wantsTestimonial ? (
        <div className="space-y-2">
          <Label htmlFor="testimonial_text">Your testimonial</Label>
          <Textarea id="testimonial_text" name="testimonial_text" rows={3} />
        </div>
      ) : null}

      {error ? (
        <p role="alert" className="text-sm text-danger-foreground">
          {error}
        </p>
      ) : null}

      <Button type="submit" disabled={isPending}>
        {isPending ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : null}
        Submit feedback
      </Button>
    </form>
  );
}
