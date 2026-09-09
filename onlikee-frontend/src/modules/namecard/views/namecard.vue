<template>
  <Container>
    <div class="namecard-header">
      <h1 class="title">
        创作者名片
      </h1>
      <p class="subtitle">
        这里展示本站创作者 / 贡献者的个人名片。点击进入详情页面了解更多。
      </p>
      <p class="subtitle">
        你也想加入？前往
        <Link
          href="https://github.com/onlikee/onlikee"
          link-text="本项目的GitHub"
          target="_blank"
          :external="true"
        />页！
      </p>
    </div>

    <div class="creator-grid">
      <RouterLink
        to="/@UnderHear"
        class="creator-card"
      >
        <div class="creator-main">
          <img
            src="https://avatars.githubusercontent.com/u/131276691?v=4"
            alt="onlikee"
            class="avatar"
          >
          <div class="info">
            <div class="name-row">
              <h3 class="name">
                onlikee
              </h3>
              <span class="role">原始创作者</span>
            </div>
            <div class="bio">
              <p class="bio-en">
                Be interested in cutting-edge, advanced, and popular technologies and keep
                exploring them.
              </p>
              <p class="bio-zh">
                对前沿、先进和热门的技术感兴趣并保持探索。
              </p>
            </div>
          </div>
        </div>
        <div class="card-footer">
          <span class="enter">enter</span>
        </div>
      </RouterLink>
    </div>
  </Container>
</template>

<script setup lang="ts">
import { Container } from '@/components/primer-vue/Container'
import { Link } from '@/components/primer-vue/Link'
</script>

<style scoped>
.namecard-header {
	text-align: center;
	margin-bottom: 3rem;
}

.title {
	font-size: 2.5rem;
	font-weight: 700;
	color: var(--fgColor-default);
	margin-bottom: 1rem;
	line-height: 1.2;
}

.subtitle {
	font-size: 18px;
	color: var(--fgColor-muted);
	line-height: 1.6;
	max-width: 620px;
	margin: 0 auto;
}

.creator-grid {
	display: grid;
	grid-template-columns: 1fr;
	gap: 1.6rem;
}

.creator-card {
	display: flex;
	flex-direction: column;
	border: 1px solid var(--borderColor-default);
	border-radius: 6px;
	padding: 1.5rem 1.6rem 1.1rem;
	text-decoration: none;
	background: var(--bgColor-default);
	position: relative;
}

.creator-card:hover {
	outline: 2px solid var(--borderColor-accent-emphasis);
	outline-offset: -1px;
	box-shadow: 0 4px 14px -4px color-mix(in srgb, var(--fgColor-default) 8%, var(--bgColor-transparent));
}

.creator-main {
	display: flex;
	gap: 1.25rem;
}

.avatar {
	width: 92px;
	height: 92px;
	border-radius: 50%;
	object-fit: cover;
	box-shadow: 0 0 0 1px var(--borderColor-translucent);
	border: 1px solid var(--borderColor-default);
}

.info {
	flex: 1;
	min-width: 0;
}

.name-row {
	display: flex;
	align-items: center;
	gap: .6rem;
	margin-bottom: .4rem;
}

.name {
	margin: 0;
	font-size: 1.25rem;
	font-weight: 600;
	color: var(--fgColor-accent);
}

.role {
	font-size: .65rem;
	text-transform: uppercase;
	letter-spacing: .5px;
	background: var(--bgColor-muted);
	padding: .25rem .55rem;
	border-radius: 12px;
	color: var(--fgColor-muted);
	font-weight: 600;
	line-height: 1;
}

.bio-zh,
.bio-en {
	margin: 0 0 .5rem;
	font-size: .85rem;
	line-height: 1.5;
	color: var(--fgColor-default);
}

.bio-zh {
	color: var(--fgColor-muted);
	font-style: italic;
}


.card-footer {
	display: flex;
	justify-content: flex-end;
}

.enter {
	font-size: 1rem;
	font-weight: 600;
	color: var(--fgColor-link);
	padding: .35rem .7rem;
	border-radius: 6px;
	transition: background .18s ease;
}

@media (max-width: 768px) {
	.name-row {
		flex-direction: column;
		align-items: flex-start;
	}

	.title {
		font-size: 2rem;
	}

	.creator-main {
		flex-direction: row;
	}

	.creator-main {
		gap: 12px;
	}

	.avatar {
		width: 64px;
		height: 64px;
	}

	.bio{
		position: relative;
		left: -76px;
		top: 10px;
		width: calc(100% + 76px);
	}

	.bio-zh,
	.bio-en {
		font-size: .8rem;
	}
}
</style>
