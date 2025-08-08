// src/components/AnimatedCard.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';

// 定義卡片的動畫效果：從下方 20px、透明度 0 的位置，滑入到正常位置
const cardVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.5,
      ease: "easeInOut"
    }
  }
};

// 這是一個高階元件，它接收一個普通的 Card 元件，並為其加上動畫
export const AnimatedCard = ({ children, className }) => {
  return (
    <motion.div variants={cardVariants}>
      <Card className={className}>
        {children}
      </Card>
    </motion.div>
  );
};
