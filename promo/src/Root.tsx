import { Composition } from 'remotion';
import { PlatesnapPromo, PROMO_DURATION } from './PlatesnapPromo';
import { FullDayOfEating, FDOE_DURATION } from './fdoe/FullDayOfEating';
import { TierSlideshow, TIER_DURATION } from './tier/TierSlideshow';
import { TricepsGuide, TRICEPS_DURATION } from './triceps/TricepsGuide';
import { GuessingStory, GUESSING_DURATION, HardgainerStory, HARDGAINER_DURATION } from './story/stories';

export const RemotionRoot: React.FC = () => (
  <>
    <Composition
      id="PlatesnapPromo"
      component={PlatesnapPromo}
      durationInFrames={PROMO_DURATION}
      fps={30}
      width={1080}
      height={1920}
    />
    <Composition
      id="FullDayOfEating"
      component={FullDayOfEating}
      durationInFrames={FDOE_DURATION}
      fps={30}
      width={1080}
      height={1920}
    />
    <Composition
      id="BicepsTierList"
      component={TierSlideshow}
      durationInFrames={TIER_DURATION}
      fps={30}
      width={1080}
      height={1920}
    />
    <Composition
      id="TricepsGuide"
      component={TricepsGuide}
      durationInFrames={TRICEPS_DURATION}
      fps={30}
      width={1080}
      height={1920}
    />
    <Composition id="GuessingStory" component={GuessingStory} durationInFrames={GUESSING_DURATION} fps={30} width={1080} height={1920} />
    <Composition id="HardgainerStory" component={HardgainerStory} durationInFrames={HARDGAINER_DURATION} fps={30} width={1080} height={1920} />
  </>
);
