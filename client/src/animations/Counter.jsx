import { useEffect, useState } from 'react';
import { useInView } from 'framer-motion';
import { useRef } from 'react';

const Counter = ({ from, to }) => {
  const [count, setCount] = useState(from);
  const ref = useRef();
  const isInView = useInView(ref);

  useEffect(() => {
    if (isInView) {
      const interval = setInterval(() => {
        setCount(prev => {
          if (prev < to) {
            return prev + Math.ceil((to - prev) / 10);
          } else {
            clearInterval(interval);
            return to;
          }
        });
      }, 50);
    }
  }, [isInView, to]);

  return <span ref={ref}>{count.toLocaleString()}</span>;
};

export default Counter;