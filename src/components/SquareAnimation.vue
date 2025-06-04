<template>
  <div class="square-animation-container" ref="containerRef">
    <!-- Top lines (top-left to top-right) -->
    <div v-for="i in 3" :key="`top-${i}`"
         class="animated-line horizontal top"
         :style="getLineStyle('top', i)">
    </div>

    <!-- Right lines (top-right to bottom-right) -->
    <div v-for="i in 3" :key="`right-${i}`"
         class="animated-line vertical right"
         :style="getLineStyle('right', i)">
    </div>

    <!-- Bottom lines (bottom-right to bottom-left) -->
    <div v-for="i in 3" :key="`bottom-${i}`"
         class="animated-line horizontal bottom"
         :style="getLineStyle('bottom', i)">
    </div>

    <!-- Left lines (bottom-left to top-left) -->
    <div v-for="i in 3" :key="`left-${i}`"
         class="animated-line vertical left"
         :style="getLineStyle('left', i)">
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, computed } from 'vue';

// Define the sides of the square
type Side = 'top' | 'right' | 'bottom' | 'left';

// Animation timing constants
const ANIMATION_DURATION = 2000; // Duration for each side in ms
const TOTAL_CYCLE_DURATION = ANIMATION_DURATION * 4; // Complete cycle duration
const LINE_DELAY = 500; // Delay between lines on the same side

const containerRef = ref<HTMLElement | null>(null);
const animationTime = ref(0);
const animationInterval = ref<number | null>(null);

// Calculate container dimensions
const containerDimensions = computed(() => {
  if (!containerRef.value) return { width: 300, height: 300 };

  const rect = containerRef.value.getBoundingClientRect();
  return {
    width: rect.width,
    height: rect.height
  };
});

// Calculate the square dimensions (80% of container size)
const squareDimensions = computed(() => {
  const size = Math.min(containerDimensions.value.width, containerDimensions.value.height) * 0.8;
  return {
    size,
    x: (containerDimensions.value.width - size) / 2,
    y: (containerDimensions.value.height - size) / 2
  };
});

// Update animation time
const updateAnimation = () => {
  animationTime.value = (animationTime.value + 16) % TOTAL_CYCLE_DURATION;
};

// Get the current animation phase (0-3)
const getCurrentPhase = computed(() => {
  return Math.floor(animationTime.value / ANIMATION_DURATION);
});

// Get progress within the current phase (0-1)
const getPhaseProgress = computed(() => {
  return (animationTime.value % ANIMATION_DURATION) / ANIMATION_DURATION;
});

// Get the style for a line based on its side and position
const getLineStyle = (side: Side, lineIndex: number) => {
  const { size, x, y } = squareDimensions.value;
  const lineThickness = 3;
  const lineSpacing = size / 12; // Space between lines (closer together)
  // Center the group of 3 lines on each side
  const startOffset = (size - (2 * lineSpacing)) / 2;
  const lineOffset = startOffset + ((lineIndex - 1) * lineSpacing); // Position of this line on its side

  // Calculate the base position and dimensions
  let baseStyle: any = {
    position: 'absolute',
    backgroundColor: 'black',
  };

  // Set position and dimensions based on the side
  switch (side) {
    case 'top':
      baseStyle = {
        ...baseStyle,
        left: `${x}px`,
        top: `${y}px`,
        height: `${lineThickness}px`,
        width: '0px', // Will be animated
        transformOrigin: 'left'
      };
      break;
    case 'right':
      baseStyle = {
        ...baseStyle,
        right: `${containerDimensions.value.width - x - size}px`,
        top: `${y}px`,
        width: `${lineThickness}px`,
        height: '0px', // Will be animated
        transformOrigin: 'top'
      };
      break;
    case 'bottom':
      baseStyle = {
        ...baseStyle,
        right: `${containerDimensions.value.width - x - size}px`,
        bottom: `${containerDimensions.value.height - y - size}px`,
        height: `${lineThickness}px`,
        width: '0px', // Will be animated
        transformOrigin: 'right'
      };
      break;
    case 'left':
      baseStyle = {
        ...baseStyle,
        left: `${x}px`,
        bottom: `${containerDimensions.value.height - y - size}px`,
        width: `${lineThickness}px`,
        height: '0px', // Will be animated
        transformOrigin: 'bottom'
      };
      break;
  }

  // Adjust position based on line index
  if (side === 'top') {
    baseStyle.top = `${y + lineOffset}px`;
  } else if (side === 'right') {
    baseStyle.right = `${(containerDimensions.value.width - x - size) + lineOffset}px`;
  } else if (side === 'bottom') {
    baseStyle.bottom = `${(containerDimensions.value.height - y - size) + lineOffset}px`;
  } else if (side === 'left') {
    baseStyle.left = `${x + lineOffset}px`;
  }

  // Calculate animation progress for this line
  const lineDelay = LINE_DELAY * (lineIndex - 1); // Delay based on line index
  // Map sides to animation phases: 0=left, 1=bottom, 2=right, 3=top
  // This creates the sequence: top-left to bottom-left, then to bottom-right, then to top-right, and back to top-left
  const sidePhaseMap: Record<Side, number> = { left: 0, bottom: 1, right: 2, top: 3 };
  const lineSidePhase = sidePhaseMap[side];

  // Check if this side is currently animating
  const isCurrentPhase = getCurrentPhase.value === lineSidePhase;
  const isPreviousPhase = (getCurrentPhase.value === (lineSidePhase + 1) % 4);

  let progress = 0;

  if (isCurrentPhase) {
    // This side is growing
    const adjustedProgress = Math.max(0, getPhaseProgress.value - (lineDelay / ANIMATION_DURATION));
    progress = adjustedProgress * (ANIMATION_DURATION / (ANIMATION_DURATION - lineDelay));
    if (progress > 1) progress = 1;
  } else if (isPreviousPhase) {
    // This side is retracting
    const adjustedProgress = Math.max(0, getPhaseProgress.value - (lineDelay / ANIMATION_DURATION));
    progress = 1 - (adjustedProgress * (ANIMATION_DURATION / (ANIMATION_DURATION - lineDelay)));
    if (progress < 0) progress = 0;
  }

  // Apply the animation progress to the line
  if (side === 'top' || side === 'bottom') {
    // For horizontal lines (top and bottom)
    if (isCurrentPhase) {
      // Growing phase
      baseStyle.width = `${size * progress}px`;
    } else if (isPreviousPhase) {
      // Retracting phase - retract from opposite side
      baseStyle.width = `${size * progress}px`;

      if (side === 'top') {
        // Top line retracts from right to left
        baseStyle.left = `${x + (size * (1 - progress))}px`;
      } else {
        // Bottom line retracts from left to right
        baseStyle.right = `${(containerDimensions.value.width - x - size) + (size * (1 - progress))}px`;
      }
    }
  } else {
    // For vertical lines (left and right)
    if (isCurrentPhase) {
      // Growing phase
      baseStyle.height = `${size * progress}px`;
    } else if (isPreviousPhase) {
      // Retracting phase - retract from opposite side
      baseStyle.height = `${size * progress}px`;

      if (side === 'right') {
        // Right line retracts from bottom to top
        baseStyle.top = `${y + (size * (1 - progress))}px`;
      } else {
        // Left line retracts from top to bottom
        baseStyle.bottom = `${(containerDimensions.value.height - y - size) + (size * (1 - progress))}px`;
      }
    }
  }

  return baseStyle;
};

// Start the animation loop
onMounted(() => {
  // Wait for the next tick to ensure the container is rendered
  setTimeout(() => {
    animationInterval.value = window.setInterval(updateAnimation, 16);
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
.square-animation-container {
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

.top{

}
.right{

}
.bottom{

}
.left{

}

.animated-line {
  position: absolute;
  background-color: black;

  &.horizontal {
    height: 3px;
  }

  &.vertical {
    width: 3px;
  }
}
</style>
