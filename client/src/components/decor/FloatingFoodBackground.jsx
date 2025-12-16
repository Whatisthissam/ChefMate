export function FloatingFoodBackground() {
  const items = [
    {
      id: 'pizza',
      src: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f355.png',
      left: '3%',
      size: 56,
      duration: 12,
      delay: -2,
      rotate: -10,
    },
    {
      id: 'burger',
      src: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f354.png',
      left: '92%',
      size: 58,
      duration: 13,
      delay: -10,
      rotate: 12,
    },
    {
      id: 'donut',
      src: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f369.png',
      left: '8%',
      size: 48,
      duration: 14,
      delay: -16,
      rotate: 8,
    },
    {
      id: 'avocado',
      src: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f951.png',
      left: '14%',
      size: 44,
      duration: 16,
      delay: -24,
      rotate: -6,
    },
    {
      id: 'sushi',
      src: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f363.png',
      left: '86%',
      size: 46,
      duration: 15,
      delay: -6,
      rotate: -8,
    },
    {
      id: 'carrot',
      src: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f955.png',
      left: '98%',
      size: 42,
      duration: 17,
      delay: -18,
      rotate: 10,
    },
    {
      id: 'fries',
      src: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f35f.png',
      left: '21%',
      size: 40,
      duration: 13,
      delay: -8,
      rotate: -12,
    },
    {
      id: 'cake',
      src: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f370.png',
      left: '79%',
      size: 52,
      duration: 16,
      delay: -12,
      rotate: 6,
    },
    {
      id: 'ramen',
      src: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f35c.png',
      left: '6%',
      size: 46,
      duration: 15,
      delay: -20,
      rotate: 10,
    },
    {
      id: 'pancakes',
      src: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f95e.png',
      left: '91%',
      size: 44,
      duration: 14,
      delay: -26,
      rotate: -6,
    },
    {
      id: 'apple',
      src: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f34e.png',
      left: '15%',
      size: 38,
      duration: 12,
      delay: -4,
      rotate: 8,
    },
    {
      id: 'cookie',
      src: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f36a.png',
      left: '85%',
      size: 40,
      duration: 17,
      delay: -14,
      rotate: 12,
    },
  ];

  return (
    <div className="floating-food-bg" aria-hidden="true">
      {items.map((it) => (
        <div
          key={it.id}
          className="floating-food-item"
          style={{
            left: it.left,
            '--ff-size': `${it.size}px`,
            '--ff-duration': `${it.duration}s`,
            '--ff-delay': `${it.delay}s`,
            '--ff-rotate': `${it.rotate}deg`,
          }}
        >
          <img className="floating-food-png" src={it.src} alt="" loading="lazy" draggable="false" />
        </div>
      ))}
    </div>
  );
}
