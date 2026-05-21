import { motion, useScroll, useTransform } from 'framer-motion';

const PageParallax = ({ children }) => {
  const { scrollY } = useScroll();
  const ySlow = useTransform(scrollY, [0, 1200], [0, -140]);
  const yFast = useTransform(scrollY, [0, 1200], [0, -220]);

  return (
    <div className="relative pt-16 overflow-x-hidden">
      <div className="fixed inset-0 -z-10 pointer-events-none">
        <motion.div
          style={{ y: ySlow }}
          className="absolute -top-20 -left-16 h-72 w-72 rounded-full bg-green-300/20 blur-3xl"
        />
        <motion.div
          style={{ y: yFast }}
          className="absolute top-1/3 -right-12 h-80 w-80 rounded-full bg-blue-300/20 blur-3xl"
        />
        <motion.div
          style={{ y: ySlow }}
          className="absolute bottom-0 left-1/3 h-64 w-64 rounded-full bg-purple-300/20 blur-3xl"
        />
      </div>
      {children}
    </div>
  );
};

export default PageParallax;
