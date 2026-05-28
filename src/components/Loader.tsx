import React from 'react';

export default function Loader() {
  return (
    <div className="generative-loader-wrapper">
      <style>{`
        .generative-loader-wrapper {
          width: 100%;
          height: 120px;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: visible;
          position: relative;
          z-index: 1;
        }

        .glass-orb {
          --c-light: #a3b18a;
          --c-dark: #344e41;
          --c-glow-dim: rgba(163, 177, 138, 0.4);
          --c-glow-bright: rgba(163, 177, 138, 0.8);
          --c-edge: rgba(163, 177, 138, 0.7);

          width: 90px;
          height: 90px;
          border-radius: 50%;
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;

          /* 玻璃球外壳质感 */
          background: rgba(255, 255, 255, 0.02);
          border: 1.5px solid var(--c-edge);

          /* 动画：整体呼吸与外发光 */
          animation: orb-breathe 4s ease-in-out infinite;

          /* 确保内部的孢子粉尘不会溢出玻璃球 */
          overflow: hidden;
          isolation: isolate;
          -webkit-mask-image: -webkit-radial-gradient(white, black);
        }

        /* 玻璃球的高光反射 */
        .glass-orb::after {
          content: '';
          position: absolute;
          top: 8%;
          left: 15%;
          width: 70%;
          height: 30%;
          border-radius: 50%;
          background: linear-gradient(to bottom, rgba(255, 255, 255, 0.7), rgba(255, 255, 255, 0));
          transform: rotate(-15deg);
          pointer-events: none;
          z-index: 10;
        }

        /* 内部发光的核心容器（阿米巴原虫形态） */
        .glowing-core {
          position: relative;
          width: 60px;
          height: 60px;
          /* 整体轻微模糊，让内部的多个部分融合在一起 */
          filter: blur(3px);
          /* 整体缓慢自转并伴随轻微的随机游走 */
          animation: core-wander-spin 15s infinite ease-in-out;
          z-index: 2;
        }

        @keyframes core-wander-spin {
          0% { transform: rotate(0deg) translate(0, 0); }
          25% { transform: rotate(90deg) translate(4px, -4px); }
          50% { transform: rotate(180deg) translate(-3px, 5px); }
          75% { transform: rotate(270deg) translate(-5px, -2px); }
          100% { transform: rotate(360deg) translate(0, 0); }
        }

        /* 核心的各个组成部分 */
        .blob-part {
          position: absolute;
          top: 50%;
          left: 50%;
          background: linear-gradient(135deg, var(--c-light), var(--c-dark));
          border-radius: 50%;
          transform-origin: center;
        }

        .blob-part.main {
          width: 44px; height: 44px;
          margin-top: -22px; margin-left: -22px;
          animation: wobble-main 4s infinite alternate ease-in-out;
        }
        .blob-part.p1 {
          width: 30px; height: 30px;
          margin-top: -15px; margin-left: -15px;
          animation: wobble-1 5.3s infinite alternate ease-in-out;
        }
        .blob-part.p2 {
          width: 26px; height: 26px;
          margin-top: -13px; margin-left: -13px;
          animation: wobble-2 6.7s infinite alternate ease-in-out;
        }
        .blob-part.p3 {
          width: 22px; height: 22px;
          margin-top: -11px; margin-left: -11px;
          animation: wobble-3 4.8s infinite alternate ease-in-out;
        }

        @keyframes wobble-main {
          0% { transform: translate(0, 0) scale(1); border-radius: 60% 40% 50% 50%; }
          100% { transform: translate(-6px, 6px) scale(1.05); border-radius: 40% 60% 40% 60%; }
        }
        @keyframes wobble-1 {
          0% { transform: translate(20px, -15px) scale(1); }
          100% { transform: translate(-18px, 18px) scale(1.2); }
        }
        @keyframes wobble-2 {
          0% { transform: translate(-22px, 14px) scale(1.1); }
          100% { transform: translate(18px, -20px) scale(0.9); }
        }
        @keyframes wobble-3 {
          0% { transform: translate(15px, 22px) scale(0.9); }
          100% { transform: translate(-20px, -18px) scale(1.3); }
        }

        /* 繁荣的孢子粉尘，在玻璃球内部飞舞 */
        .spores-container {
          position: absolute;
          width: 100%;
          height: 100%;
          top: 0;
          left: 0;
          z-index: 3;
          /* 容器缓慢反向旋转，叠加在游走动画上，形成极其复杂的混沌运动 */
          animation: container-spin 30s infinite linear reverse;
        }

        @keyframes container-spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .spore {
          position: absolute;
          top: 50%;
          left: 50%;
          background: #d8e2c8;
          border-radius: 50%;
          box-shadow: 0 0 6px #d8e2c8;
          opacity: 0;
        }

        /* 35颗孢子，使用负数 delay 让它们在初始状态就已经布满整个球体 */
        .s1 { width: 4px; height: 4px; animation: wander-1 8s infinite ease-in-out; animation-delay: -1s; }
        .s2 { width: 3px; height: 3px; animation: wander-2 9s infinite ease-in-out; animation-delay: -3s; }
        .s3 { width: 5px; height: 5px; animation: wander-3 7s infinite ease-in-out; animation-delay: -5s; }
        .s4 { width: 4px; height: 4px; animation: wander-4 10s infinite ease-in-out; animation-delay: -2s; }
        .s5 { width: 3px; height: 3px; animation: wander-5 8.5s infinite ease-in-out; animation-delay: -6s; }
        .s6 { width: 5px; height: 5px; animation: wander-6 7.5s infinite ease-in-out; animation-delay: -4s; }
        .s7 { width: 4px; height: 4px; animation: wander-7 9.5s infinite ease-in-out; animation-delay: -7s; }
        .s8 { width: 3px; height: 3px; animation: wander-8 8.2s infinite ease-in-out; animation-delay: -1.5s; }
        .s9 { width: 4px; height: 4px; animation: wander-9 7.8s infinite ease-in-out; animation-delay: -8s; }
        .s10 { width: 5px; height: 5px; animation: wander-10 9.2s infinite ease-in-out; animation-delay: -2.5s; }
        .s11 { width: 3px; height: 3px; animation: wander-1 7.2s infinite ease-in-out; animation-delay: -4.5s; }
        .s12 { width: 4px; height: 4px; animation: wander-2 8.8s infinite ease-in-out; animation-delay: -0.5s; }
        .s13 { width: 5px; height: 5px; animation: wander-3 9.7s infinite ease-in-out; animation-delay: -6.5s; }
        .s14 { width: 4px; height: 4px; animation: wander-4 7.4s infinite ease-in-out; animation-delay: -3.5s; }
        .s15 { width: 3px; height: 3px; animation: wander-5 8.9s infinite ease-in-out; animation-delay: -8.5s; }
        .s16 { width: 5px; height: 5px; animation: wander-6 9.1s infinite ease-in-out; animation-delay: -1.2s; }
        .s17 { width: 4px; height: 4px; animation: wander-7 7.6s infinite ease-in-out; animation-delay: -5.2s; }
        .s18 { width: 3px; height: 3px; animation: wander-8 8.4s infinite ease-in-out; animation-delay: -2.8s; }
        .s19 { width: 4px; height: 4px; animation: wander-9 9.6s infinite ease-in-out; animation-delay: -7.2s; }
        .s20 { width: 5px; height: 5px; animation: wander-10 7.9s infinite ease-in-out; animation-delay: -0.8s; }
        .s21 { width: 3px; height: 3px; animation: wander-3 8.1s infinite ease-in-out; animation-delay: -9s; }
        .s22 { width: 4px; height: 4px; animation: wander-6 9.4s infinite ease-in-out; animation-delay: -3.1s; }
        .s23 { width: 5px; height: 5px; animation: wander-9 7.3s infinite ease-in-out; animation-delay: -5.8s; }
        .s24 { width: 4px; height: 4px; animation: wander-2 8.7s infinite ease-in-out; animation-delay: -1.9s; }
        .s25 { width: 3px; height: 3px; animation: wander-5 9.8s infinite ease-in-out; animation-delay: -7.5s; }
        .s26 { width: 5px; height: 5px; animation: wander-8 7.1s infinite ease-in-out; animation-delay: -4.2s; }
        .s27 { width: 4px; height: 4px; animation: wander-1 8.3s infinite ease-in-out; animation-delay: -2.1s; }
        .s28 { width: 3px; height: 3px; animation: wander-4 9.9s infinite ease-in-out; animation-delay: -6.8s; }
        .s29 { width: 4px; height: 4px; animation: wander-7 7.7s infinite ease-in-out; animation-delay: -0.3s; }
        .s30 { width: 5px; height: 5px; animation: wander-10 8.6s infinite ease-in-out; animation-delay: -5.5s; }
        .s31 { width: 3px; height: 3px; animation: wander-2 9.3s infinite ease-in-out; animation-delay: -8.1s; }
        .s32 { width: 4px; height: 4px; animation: wander-5 7.5s infinite ease-in-out; animation-delay: -3.7s; }
        .s33 { width: 5px; height: 5px; animation: wander-8 8.8s infinite ease-in-out; animation-delay: -1.4s; }
        .s34 { width: 4px; height: 4px; animation: wander-1 9.5s infinite ease-in-out; animation-delay: -6.2s; }
        .s35 { width: 3px; height: 3px; animation: wander-4 7.9s infinite ease-in-out; animation-delay: -4.8s; }

        /* 10条分布在不同区域的环绕游走轨迹，避免在中心长时间重叠 */
        @keyframes wander-1 {
          0% { transform: translate(15px, -15px) scale(1); opacity: 0.5; }
          33% { transform: translate(35px, -5px) scale(1.2); opacity: 0.9; }
          66% { transform: translate(25px, -35px) scale(0.8); opacity: 0.6; }
          100% { transform: translate(15px, -15px) scale(1); opacity: 0.5; }
        }
        @keyframes wander-2 {
          0% { transform: translate(-15px, 15px) scale(1); opacity: 0.6; }
          33% { transform: translate(-35px, 5px) scale(0.8); opacity: 0.9; }
          66% { transform: translate(-25px, 35px) scale(1.2); opacity: 0.5; }
          100% { transform: translate(-15px, 15px) scale(1); opacity: 0.6; }
        }
        @keyframes wander-3 {
          0% { transform: translate(-15px, -15px) scale(1); opacity: 0.9; }
          33% { transform: translate(-5px, -35px) scale(1.2); opacity: 0.5; }
          66% { transform: translate(-35px, -25px) scale(0.8); opacity: 0.8; }
          100% { transform: translate(-15px, -15px) scale(1); opacity: 0.9; }
        }
        @keyframes wander-4 {
          0% { transform: translate(15px, 15px) scale(1); opacity: 0.5; }
          33% { transform: translate(5px, 35px) scale(0.8); opacity: 0.9; }
          66% { transform: translate(35px, 25px) scale(1.2); opacity: 0.6; }
          100% { transform: translate(15px, 15px) scale(1); opacity: 0.5; }
        }
        @keyframes wander-5 {
          0% { transform: translate(0, -35px) scale(1); opacity: 0.4; }
          25% { transform: translate(35px, 0) scale(1.3); opacity: 0.9; }
          50% { transform: translate(0, 35px) scale(0.9); opacity: 0.5; }
          75% { transform: translate(-35px, 0) scale(1.2); opacity: 0.8; }
          100% { transform: translate(0, -35px) scale(1); opacity: 0.4; }
        }
        @keyframes wander-6 {
          0% { transform: translate(0, 30px) scale(1); opacity: 0.8; }
          25% { transform: translate(30px, 0) scale(0.8); opacity: 0.5; }
          50% { transform: translate(0, -30px) scale(1.2); opacity: 0.9; }
          75% { transform: translate(-30px, 0) scale(0.9); opacity: 0.6; }
          100% { transform: translate(0, 30px) scale(1); opacity: 0.8; }
        }
        @keyframes wander-7 {
          0% { transform: translate(-25px, -20px) scale(1); opacity: 0.5; }
          50% { transform: translate(-20px, 25px) scale(1.3); opacity: 0.9; }
          100% { transform: translate(-25px, -20px) scale(1); opacity: 0.5; }
        }
        @keyframes wander-8 {
          0% { transform: translate(25px, 20px) scale(1); opacity: 0.9; }
          50% { transform: translate(20px, -25px) scale(0.8); opacity: 0.4; }
          100% { transform: translate(25px, 20px) scale(1); opacity: 0.9; }
        }
        @keyframes wander-9 {
          0% { transform: translate(-20px, -25px) scale(1); opacity: 0.6; }
          50% { transform: translate(25px, -20px) scale(1.2); opacity: 0.9; }
          100% { transform: translate(-20px, -25px) scale(1); opacity: 0.6; }
        }
        @keyframes wander-10 {
          0% { transform: translate(20px, 25px) scale(1); opacity: 0.8; }
          50% { transform: translate(-25px, 20px) scale(0.9); opacity: 0.5; }
          100% { transform: translate(20px, 25px) scale(1); opacity: 0.8; }
        }

        @keyframes orb-breathe {
          0%, 100% {
            transform: scale(1) translateY(0);
            box-shadow:
              0 0 35px var(--c-glow-dim),
              inset 0 0 20px var(--c-glow-dim),
              inset 0 -15px 20px rgba(52, 78, 65, 0.2),
              inset 0 10px 15px rgba(255, 255, 255, 0.4);
          }
          50% {
            transform: scale(1.03) translateY(-3px);
            box-shadow:
              0 0 55px var(--c-glow-bright),
              inset 0 0 30px var(--c-glow-bright),
              inset 0 -15px 20px rgba(52, 78, 65, 0.3),
              inset 0 10px 15px rgba(255, 255, 255, 0.6);
          }
        }
      `}</style>

      <div className="glass-orb">
        <div className="glowing-core">
          <div className="blob-part main" />
          <div className="blob-part p1" />
          <div className="blob-part p2" />
          <div className="blob-part p3" />
        </div>
        <div className="spores-container">
          <div className="spore s1" />
          <div className="spore s2" />
          <div className="spore s3" />
          <div className="spore s4" />
          <div className="spore s5" />
          <div className="spore s6" />
          <div className="spore s7" />
          <div className="spore s8" />
          <div className="spore s9" />
          <div className="spore s10" />
          <div className="spore s11" />
          <div className="spore s12" />
          <div className="spore s13" />
          <div className="spore s14" />
          <div className="spore s15" />
          <div className="spore s16" />
          <div className="spore s17" />
          <div className="spore s18" />
          <div className="spore s19" />
          <div className="spore s20" />
          <div className="spore s21" />
          <div className="spore s22" />
          <div className="spore s23" />
          <div className="spore s24" />
          <div className="spore s25" />
          <div className="spore s26" />
          <div className="spore s27" />
          <div className="spore s28" />
          <div className="spore s29" />
          <div className="spore s30" />
          <div className="spore s31" />
          <div className="spore s32" />
          <div className="spore s33" />
          <div className="spore s34" />
          <div className="spore s35" />
        </div>
      </div>
    </div>
  );
}
