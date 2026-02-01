import { Progress } from 'radix-ui';
import * as React from 'react';
import { useEffect } from 'react';

const LoadingBar = ({ percent }:{percent:number}) => {
  const [progress, setProgress] = React.useState(0);
  useEffect(() => {
    setProgress(percent);
  }, [percent]);
  return (
    <Progress.Root
      className="relative h-[25px] w-full overflow-hidden rounded-full bg-blackA6 border-solid border-2 border-gray-800"
      style={{
        transform: 'translateZ(0)',
      }}
      value={progress}
    >
      <Progress.Indicator
        className="ease-[cubic-bezier(0.65, 0, 0.35, 1)] size-full bg-white transition-transform duration-[660ms]"
        style={{ transform: `translateX(-${100 - progress}%)` }}
      />
    </Progress.Root>
  );
};

export default LoadingBar;
