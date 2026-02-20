import { useEffect } from 'react';
import { motion } from 'framer-motion';
import Layout from './components/layout/Layout';
import PrayerCountdown from './components/prayer/PrayerCountdown';
import PrayerTimesCard from './components/prayer/PrayerTimesCard';
import FastingCountdown from './components/fasting/FastingCountdown';
import FastingInfoCard from './components/fasting/FastingInfoCard';
import ReligiousDaysCard from './components/calendar/ReligiousDaysCard';
import HolidayCard from './components/calendar/HolidayCard';
import CalendarView from './components/calendar/CalendarView';
import { useLocation } from './hooks/useLocation';

const gridContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const gridItem = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' as const } },
};

function App() {
  const { detect } = useLocation();

  useEffect(() => {
    detect();
  }, [detect]);

  return (
    <Layout>
      <motion.div
        className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-2"
        variants={gridContainer}
        initial="hidden"
        animate="show"
      >
        {/* Top row — countdowns */}
        <motion.div variants={gridItem}><PrayerCountdown /></motion.div>
        <motion.div variants={gridItem}><FastingCountdown /></motion.div>

        {/* Second row — detail cards */}
        <motion.div variants={gridItem}><PrayerTimesCard /></motion.div>
        <motion.div variants={gridItem}><FastingInfoCard /></motion.div>

        {/* Third row — calendar cards */}
        <motion.div variants={gridItem}><ReligiousDaysCard /></motion.div>
        <motion.div variants={gridItem}><HolidayCard /></motion.div>

        {/* Full-width calendar */}
        <motion.div variants={gridItem} className="md:col-span-2">
          <CalendarView />
        </motion.div>
      </motion.div>
    </Layout>
  );
}

export default App;
