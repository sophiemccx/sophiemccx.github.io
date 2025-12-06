import React, { useRef, useEffect } from "react";

const Canvas = ({ jpPrice = 133.5, msPrice = 54.55, ...props }) => {
  const canvasRef = useRef(null);
  const dotsRef = useRef([]);
  const explosionsRef = useRef([]);
  const speed = 0.25;
  const spawnCounterRef = useRef(0);
  const prevPricesRef = useRef({ jp: jpPrice, ms: msPrice });

  const getSpawnRate = (currentPrice, prevPrice) => {
    const priceChange = ((currentPrice - prevPrice) / prevPrice) * 100;
    const multiplier = Math.max(0.4, Math.min(2.5, 1 + (priceChange / 5)));
    return 60 / multiplier;
  };

  const draw = (ctx) => {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    
    // Draw explosions first (behind troops)
for (let i = explosionsRef.current.length - 1; i >= 0; i--) {
  const exp = explosionsRef.current[i];
  const alpha = 1 - (exp.age / exp.maxAge);
  const radius = exp.radius * (1 + exp.age / exp.maxAge);

  const gradient = ctx.createRadialGradient(exp.x, exp.y, 0, exp.x, exp.y, radius);
  gradient.addColorStop(0, `rgba(255, 100, 200, ${alpha * 0.9})`);
  gradient.addColorStop(0.5, `rgba(150, 120, 255, ${alpha * 0.6})`);
  gradient.addColorStop(1, `rgba(100, 255, 255, ${alpha * 0.3})`);  

  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(exp.x, exp.y, radius, 0, 2 * Math.PI);
  ctx.fill();

  ctx.strokeStyle = `rgba(180, 255, 255, ${alpha * 0.8})`;
  ctx.shadowBlur = 10;
  ctx.shadowColor = `rgba(100, 200, 255, ${alpha})`;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(exp.x, exp.y, radius + 3, 0, 2 * Math.PI);
  ctx.stroke();

  ctx.shadowBlur = 0;

  exp.age++;
  if (exp.age >= exp.maxAge) {
    explosionsRef.current.splice(i, 1);
  }
}
    
    // Draw troops
    for (let i = 0; i < dotsRef.current.length; i++) {
      const dot = dotsRef.current[i];
      const color = dot.team === "jp" ? "#82ca9d" : "#6599bbff";
      
      // troop body
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(dot.x, dot.y, 5, 0, 2 * Math.PI);
      ctx.fill();
      
      // glow effect
      ctx.shadowBlur = 8;
      ctx.shadowColor = color;
      ctx.fill();
      ctx.shadowBlur = 0;
      
      // direction indicator (small triangle)
      ctx.fillStyle = color;
      ctx.beginPath();
      if (dot.team === "jp") {
        ctx.moveTo(dot.x + 7, dot.y);
        ctx.lineTo(dot.x + 4, dot.y - 3);
        ctx.lineTo(dot.x + 4, dot.y + 3);
      } else {
        ctx.moveTo(dot.x - 7, dot.y);
        ctx.lineTo(dot.x - 4, dot.y - 3);
        ctx.lineTo(dot.x - 4, dot.y + 3);
      }
      ctx.closePath();
      ctx.fill();
    }
  };

  const createExplosion = (x, y) => {
    explosionsRef.current.push({
      x: x,
      y: y,
      radius: 8,
      age: 0,
      maxAge: 15
    });
  };

  const checkCollisions = () => {
    const dots = dotsRef.current;
    const toRemove = new Set();
    
    for (let i = 0; i < dots.length; i++) {
      if (toRemove.has(i)) continue;
      
      for (let j = i + 1; j < dots.length; j++) {
        if (toRemove.has(j)) continue;
        
        if (dots[i].team !== dots[j].team) {
          const dx = dots[i].x - dots[j].x;
          const dy = dots[i].y - dots[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < 12) {
            // Create explosion at collision point
            createExplosion((dots[i].x + dots[j].x) / 2, (dots[i].y + dots[j].y) / 2);
            toRemove.add(i);
            toRemove.add(j);
            break;
          }
        }
      }
    }
    
    dotsRef.current = dots.filter((_, index) => !toRemove.has(index));
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    let animationFrameId;

    // Initialize with some dots
    for (let i = 0; i < 1; i++) {
      dotsRef.current.push({
        x: Math.random() * 100,
        y: Math.random() * canvas.height,
        multiplier: Math.random() * 1 + 0.5,
        team: "jp"
      });
      
      dotsRef.current.push({
        x: canvas.width - Math.random() * 100,
        y: Math.random() * canvas.height,
        multiplier: Math.random() * 1 + 0.5,
        team: "ms"
      });
    }

    const render = () => {
      for (let i = 0; i < dotsRef.current.length; i++) {
        const dot = dotsRef.current[i];
        if (dot.team === "jp") {
          dot.x += speed + dot.multiplier;
        } else {
          dot.x -= speed + dot.multiplier;
        }
      }
      
      checkCollisions();
      
      const jpSpawnRate = getSpawnRate(jpPrice, prevPricesRef.current.jp);
      const msSpawnRate = getSpawnRate(msPrice, prevPricesRef.current.ms);
      
      spawnCounterRef.current++;
      
      if (spawnCounterRef.current % Math.round(jpSpawnRate) === 0) {
        dotsRef.current.push({
          x: 0,
          y: Math.random() * canvas.height,
          multiplier: Math.random() * 1 + 0.5,
          team: "jp"
        });
      }
      
      if (spawnCounterRef.current % Math.round(msSpawnRate) === 0) {
        dotsRef.current.push({
          x: canvas.width,
          y: Math.random() * canvas.height,
          multiplier: Math.random() * 1 + 0.5,
          team: "ms"
        });
      }
      
      dotsRef.current = dotsRef.current.filter(dot => 
        dot.x >= -10 && dot.x <= canvas.width + 10
      );

      draw(context);
      animationFrameId = window.requestAnimationFrame(render);
    };
    
    render();

    return () => {
      window.cancelAnimationFrame(animationFrameId);
    };
  }, [jpPrice, msPrice]);

  useEffect(() => {
    prevPricesRef.current = { jp: jpPrice, ms: msPrice };
  }, [jpPrice, msPrice]);

  return <canvas ref={canvasRef} {...props} />;
};

export default Canvas;