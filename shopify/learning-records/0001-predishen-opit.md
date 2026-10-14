# Предишен опит: силен HTML/CSS, практика със секции в Horizon, слаб JS

Потребителят казва, че HTML/CSS познава добре, а JavaScript малко. В `horizon-first-theme` (~50 commit-а, юли–октомври 2026) вече е направил собствени секции (`simple-hero`, `slider-media-and-text`, `featured-cards`) с `{% liquid %}`, `assign`, `default`, `!= blank`, `image_url`/`image_tag`, `video_tag`, `content_for 'blocks'` и schema с много настройки. Работи с feedback през GitHub issues.

**Implications:** не обяснявай HTML/CSS и основите на секциите от нулата. Liquid го ползва, но вероятно по образец, без цялостен модел (виж LR-0002). JS се въвежда бавно, с много обяснение, когато стигнем до интерактивни компоненти.
