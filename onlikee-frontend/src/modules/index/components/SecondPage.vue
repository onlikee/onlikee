<template>
  <div class="second-page">
    <div class="second-grid">
      <div class="panel-text panel-vision">
        <h2 class="panel-title">Vision</h2>
        <p class="panel-description">
          不同于行业巨头Vecel，我希望提供门槛更低的页面托管服务，简单的就是最棒的。
        </p>
        <p class="italic text-gray-600">绝不是因为只能做成这样！:(</p>
      </div>
      <div class="panel-image panel-city">
        <img src="../assests/image-0.svg" alt="Futuristic city illustration" />
      </div>
      <div class="panel-text panel-mission">
        <h2 class="panel-title">Mission</h2>
        <p class="panel-description">
          我希望每个刚踏入编程领域的新手们，都能在最短时间内，把自己的代码变成真正被世界访问的作品，以便获得10倍的成就感。
        </p>
      </div>
      <div class="panel-image panel-space">
        <img src="../assests/image-1.webp" alt="Astronaut floating near a colorful cosmic ring" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.second-page {
  display: flex;
  justify-content: center;
  width: 100%;
  height: calc(100vh - var(--header-height));
  background-color: #fff;
}
.second-grid {
  width: 100%;
  height: 100%;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  grid-template-rows: repeat(2, 1fr);
  max-width: 1440px;
}

.panel-vision {
  order: 1;
}

.panel-city {
  order: 2;
  z-index: 1;
}

.panel-space {
  order: 3;
}

.panel-mission {
  order: 4;
  z-index: 0;
}

.panel-text,
.panel-image {
  min-width: 0;
  min-height: 0;
}

.panel-text {
  display: grid;
  align-content: center;
  gap: clamp(1rem, 1.8vw, 2rem);
  padding: clamp(2rem, 4vw, 4.5rem);
}

.panel-title {
  margin: 0;
  font-size: 6rem;
  font-weight: 500;
  line-height: 1;
  letter-spacing: -0.03em;
}

.panel-description {
  margin: 0;
  max-width: 34rem;
  font-size: 1.5rem;
  line-height: 1.45;
}

.panel-city img {
  width: 100%;
  height: 100%;
  margin-left: auto;
  margin-top: 16px;
}

.panel-space img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.panel-mission {
  border-top: 1px solid #2f3a63;
}

@media (max-width: 768px) {
  .second-page {
    height: auto;
  }

  .second-grid {
    height: auto;
    display: block;
  }

  .panel-text {
    padding: 4rem 2rem;
  }

  .panel-title {
    font-size: 3rem;
  }

  .panel-description {
    font-size: 1rem;
  }

  .panel-city {
    display: flex;
    justify-content: center;
    padding: 0rem 2rem;
  }

  .panel-city img {
    width: 100%;
  }
}
</style>
