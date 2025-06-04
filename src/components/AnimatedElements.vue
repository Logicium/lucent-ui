<template>
  <div class="animation-container" ref="containerRef">
    <div v-for="(item, index) in animatedItems" :key="index"
         class="animated-line"
         :style="getItemStyle(item)">
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue';

// Define the structure for our animated items
interface AnimatedItem {
  id: number;
  type: 'vertical' | 'horizontal';
  x: number;
  y: number;
  width: number;
  height: number;
  duration: number;
  delay: number;
  animationProgress: number;
}

const animatedItems = ref<AnimatedItem[]>([]);
const animationInterval = ref<number | null>(null);
const containerRef = ref<HTMLElement | null>(null);
let nextId = 0;

// Create a new random item
const createRandomItem = (): AnimatedItem => {
  // Get container dimensions from ref
  const container = containerRef.value;
  if (!container) return {
    id: nextId++,
    type: 'vertical',
    x: 0,
    y: 0,
    width: 3,
    height: 0,
    duration: 3000,
    delay: 0,
    animationProgress: 0
  };

  const containerRect = container.getBoundingClientRect();
  const containerWidth = containerRect.width;
  const containerHeight = containerRect.height;

  // 50/50 chance of vertical or horizontal line
  const type = Math.random() < 0.5 ? 'vertical' : 'horizontal';

  let width, height, maxX, maxY;

  if (type === 'vertical') {
    // Vertical line: fixed width, variable height
    width = 3;
    // Random height up to 30% of container height
    const maxHeight = Math.floor(containerHeight * 0.6);
    height = Math.floor(Math.random() * (maxHeight - 20)) + 20;
    // Random position
    maxX = containerWidth - width;
    maxY = containerHeight - height;
  } else {
    // Horizontal line: fixed height, variable width
    height = 3;
    // Random width up to 30% of container width
    const maxWidth = Math.floor(containerWidth * 0.6);
    width = Math.floor(Math.random() * (maxWidth - 20)) + 20;
    // Random position
    maxX = containerWidth - width;
    maxY = containerHeight - height;
  }

  const x = Math.floor(Math.random() * maxX);
  const y = Math.floor(Math.random() * maxY);

  // Random duration between 3-5 seconds
  const duration = Math.random() * 2000 + 3000;

  // Random delay for staggered start
  const delay = Math.random() * 1000;

  return {
    id: nextId++,
    type,
    x,
    y,
    width,
    height,
    duration,
    delay,
    animationProgress: 0
  };
};

// Initialize with 8 random items
const initializeItems = () => {
  animatedItems.value = [];
  for (let i = 0; i < 8; i++) {
    animatedItems.value.push(createRandomItem());
  }
};

// Update animation progress and replace completed items
const updateAnimations = () => {
  animatedItems.value.forEach((item, index) => {
    // Increment animation progress
    item.animationProgress += 16; // Approximately 16ms per frame at 60fps

    // If animation is complete, replace with a new item
    if (item.animationProgress >= item.duration + item.delay) {
      animatedItems.value[index] = createRandomItem();
    }
  });
};

// Get the CSS style for an item based on its properties and animation progress
const getItemStyle = (item: AnimatedItem) => {
  // Calculate animation progress as a percentage (0-1)
  let progress = Math.max(0, item.animationProgress - item.delay) / item.duration;
  if (progress > 1) progress = 1;

  // For the animation, we want to grow from 0 to full size and back to 0
  let scale = 0;
  if (progress < 0.4) {
    // Grow from 0 to 1 in the first 40% of the animation
    scale = progress / 0.4;
  } else if (progress < 0.6) {
    // Stay at full size for 20% of the animation
    scale = 1;
  } else {
    // Shrink from 1 to 0 in the last 40% of the animation
    scale = 1 - ((progress - 0.6) / 0.4);
  }

  // Apply the scale based on line orientation
  let currentWidth = item.width;
  let currentHeight = item.height;

  if (item.type === 'vertical') {
    // For vertical lines, scale the height
    currentHeight = item.height * scale;
  } else {
    // For horizontal lines, scale the width
    currentWidth = item.width * scale;
  }

  // Calculate opacity (fade in/out at the start/end)
  let opacity = 1;
  if (progress < 0.1) {
    opacity = progress / 0.1; // Fade in
  } else if (progress > 0.9) {
    opacity = 1 - ((progress - 0.9) / 0.1); // Fade out
  }

  return {
    position: 'absolute',
    left: `${item.x}px`,
    top: `${item.y}px`,
    width: `${currentWidth}px`,
    height: `${currentHeight}px`,
    opacity: opacity,
    backgroundColor: 'black',
    transformOrigin: item.type === 'vertical' ? 'top' : 'left'
  };
};

// Start the animation loop
onMounted(() => {
  // Wait for the next tick to ensure the container is rendered
  setTimeout(() => {
    initializeItems();
    animationInterval.value = window.setInterval(updateAnimations, 16);
  }, 0);
});

// Clean up on component unmount
onBeforeUnmount(() => {
  if (animationInterval.value !== null) {
    clearInterval(animationInterval.value);
  }
});
</script>

<style scoped lang="scss">
.animation-container {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 300px;

  @media (max-width: 768px) {
    min-height: 250px;
  }

  @media (max-width: 480px) {
    min-height: 200px;
  }
}

.animated-line {
  position: absolute;
  background-color: black;
}
</style>
