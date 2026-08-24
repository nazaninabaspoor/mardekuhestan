import Image from "next/image";

import type { JourneyStory } from "@/lib/journey-stories";

type JourneyStoryPanelProps = {
  story: JourneyStory;
  visible: boolean;
  isLast: boolean;
  onContinue: () => void;
};

export function JourneyStoryPanel({ story, visible, isLast, onContinue }: JourneyStoryPanelProps) {
  return (
    <article className={`journey-story${visible ? " is-visible" : ""}`} aria-hidden={!visible}>
      <div className="journey-story__image" aria-hidden="true">
        <Image src={story.image} alt="" width={180} height={210} sizes="120px" />
      </div>
      <div className="journey-story__copy">
        <span>فصل {story.id} از ۵</span>
        <h2>{story.title}</h2>
        <p>{story.text}</p>
        <strong>{story.moment}</strong>
        <button type="button" onClick={onContinue} tabIndex={visible ? 0 : -1}>
          {isLast ? "تماشای مسیر کامل" : "ادامه مسیر"}
          <b aria-hidden="true">←</b>
        </button>
      </div>
    </article>
  );
}
