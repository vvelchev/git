async function applyRetinaCrop() {
	console.log("🚀 Плъгинът стартира...");
	const selection = figma.currentPage.selection;
	console.log(selection);
  
	if (selection.length === 0) {
	  figma.notify("❌ Селектирай обект със снимка!");
	  figma.closePlugin();
	  return;
	}

	// Зареждаме UI-то само веднъж за целия процес
	figma.showUI(__html__, { visible: false });
  
	const tasks: {
	  node: GeometryMixin & LayoutMixin & SceneNode;
	  fill: ImageFill;
	  parentNode?: FrameNode;
	}[] = [];
  
	for (const selected of selection) {
	  // Специален случай: директно селектиран RECTANGLE с image fill
	  if (selected.type === "RECTANGLE" && "fills" in selected && selected.fills !== figma.mixed) {
		const fill = (selected.fills as Paint[]).find((f) => f.type === "IMAGE") as ImageFill | undefined;
  
		if (fill && fill.imageHash) {
		  const parentFrame = findClippingParentFrame(selected as SceneNode);
		  const hasOverflow =
			parentFrame &&
			hasOverflowRelativeToParent(
			  selected as SceneNode & { x: number; y: number; width: number; height: number },
			  parentFrame
			);
  
		  if (parentFrame && hasOverflow) {
			// Сценарий 2 – използваме рамката като viewport
			tasks.push({
			  node: selected as unknown as GeometryMixin & LayoutMixin & SceneNode,
			  fill,
			  parentNode: parentFrame,
			});
		  } else {
			// Сценарий 1 – директен fill
			tasks.push({
			  node: selected as unknown as GeometryMixin & LayoutMixin & SceneNode,
			  fill,
			});
		  }
  
		  continue;
		}
	  }
  
	  // СЛУЧАЙ 1: Node с image fill (Rectangle / Frame и др.)
	  if ("fills" in selected && selected.fills !== figma.mixed) {
		const fill = (selected.fills as Paint[]).find((f) => f.type === "IMAGE") as ImageFill | undefined;
  
		if (fill && fill.imageHash) {
		  tasks.push({
			node: selected as unknown as GeometryMixin & LayoutMixin & SceneNode,
			fill,
		  });
		  continue;
		}
	  }
  
	  // СЛУЧАЙ 2: Frame/Group/Component, чийто пръв child е image node
	  if (
		(selected.type === "FRAME" || selected.type === "GROUP" || selected.type === "COMPONENT") &&
		"children" in selected
	  ) {
		const imageChild = (selected.children as SceneNode[]).find(
		  (child) =>
			child.type === "RECTANGLE" &&
			"fills" in child &&
			child.fills !== figma.mixed &&
			(child.fills as Paint[]).some((f) => f.type === "IMAGE")
		) as (RectangleNode & GeometryMixin) | undefined;
  
		if (imageChild) {
		  const childFill = (imageChild.fills as Paint[]).find((f) => f.type === "IMAGE") as ImageFill;
		  tasks.push({
			node: imageChild,
			fill: childFill,
			parentNode: selected as FrameNode,
		  });
		  continue;
		}
	  }
	}
  
	if (tasks.length === 0) {
	  figma.notify("❌ Нито един от селектираните обекти няма изображение.");
	  figma.closePlugin();
	  return;
	}
  
	const total = tasks.length;
	let completed = 0;
  
	// Една нотификация, която „ъпдейтваме“ като текст (0% → 100%)
	let progressNotification: NotificationHandler | null = null;
	progressNotification = figma.notify(`Прогрес: 0% (0/${total})`);
  
	for (const task of tasks) {
	  await processFillImage(task.node, task.fill, task.parentNode);
	  completed += 1;
  
	  const percent = Math.round((completed / total) * 100);
  
	  if (progressNotification) {
		progressNotification.cancel();
	  }
	  progressNotification = figma.notify(`Прогрес: ${percent}% (${completed}/${total})`);
	}
  
	// Оставяме 100% съобщението видимо още ~500 ms, след което го махаме и затваряме плъгина
	if (progressNotification) {
	  setTimeout(() => {
		progressNotification && progressNotification.cancel();
		figma.closePlugin();
	  }, 500);
	} else {
	  figma.closePlugin();
	}
  }
  
  function findClippingParentFrame(node: SceneNode): FrameNode | null {
	let current = node.parent;
  
	while (current) {
	  if (
		(current.type === "FRAME" || current.type === "COMPONENT" || current.type === "INSTANCE") &&
		"clipsContent" in current &&
		(current as FrameNode).clipsContent
	  ) {
		return current as FrameNode;
	  }
  
	  current = current.parent;
	}
  
	return null;
  }
  
  function hasOverflowRelativeToParent(
	node: SceneNode & { x: number; y: number; width: number; height: number },
	parent: FrameNode
  ): boolean {
	const left = node.x;
	const top = node.y;
	const right = node.x + node.width;
	const bottom = node.y + node.height;
  
	return left < 0 || top < 0 || right > parent.width || bottom > parent.height;
  }
  
  async function processFillImage(
	node: GeometryMixin & LayoutMixin & SceneNode,
	fill: ImageFill,
	parentNode?: FrameNode
  ) {
	const image = figma.getImageByHash(fill.imageHash!);
	if (!image) {
	  figma.notify("❌ Не може да се намери изображението.");
	  figma.closePlugin();
	  return;
	}
  
	console.log("📦 Взимане на данни за изображението...");
	const originalSize = await image.getSizeAsync();
	const bytes = await image.getBytesAsync();
  
	// ── Изчисляване на видимата зона (intersection между child и Frame) ─────────
	// За СЛУЧАЙ 1 (без parentNode): viewPort = самия node
	// За СЛУЧАЙ 2 (с parentNode):   viewPort = пресечната зона между child и Frame
	let viewWidth:  number;
	let viewHeight: number;
	// Колко е офсетнат child-ът спрямо Frame-а (използва се при crop-а)
	let offsetX = 0;
	let offsetY = 0;
  
	if (parentNode) {
	  // Позицията на child-а в координатната система на Frame-а
	  const childX = (node as SceneNode & { x: number; y: number }).x;
	  const childY = (node as SceneNode & { x: number; y: number }).y;
  
	  // Видима зона = пресечна точка между [childX, childX+childW] и [0, frameW]
	  const visLeft   = Math.max(0, childX);
	  const visTop    = Math.max(0, childY);
	  const visRight  = Math.min(parentNode.width,  childX + node.width);
	  const visBottom = Math.min(parentNode.height, childY + node.height);
  
	  viewWidth  = Math.max(0, visRight  - visLeft);
	  viewHeight = Math.max(0, visBottom - visTop);
  
	  // Офсетът в пиксели вътре в child-а откъдето започва видимата зона
	  offsetX = visLeft - childX;
	  offsetY = visTop  - childY;
	} else {
	  viewWidth  = node.width;
	  viewHeight = node.height;
	}
  
	await new Promise<void>((resolve) => {
	  figma.ui.onmessage = async (msg) => {
		if (msg.error) {
		  figma.notify("Грешка в UI: " + msg.error);
		  figma.closePlugin();
		  resolve();
		  return;
		}
  
		if (msg.newBytes) {
		  console.log("📥 Получени са нови байтове. Подмяна...");
		  const newImage = figma.createImage(msg.newBytes);
		  const newFill  = JSON.parse(JSON.stringify(fill)) as ImageFill;
  
		  newFill.imageHash      = newImage.hash;
		  newFill.imageTransform = [[1, 0, 0], [0, 1, 0]];
		  newFill.scaleMode      = "FILL";
  
		  (node as GeometryMixin).fills = [newFill];
  
		  if (parentNode) {
			// Ресизваме child-а точно до видимата зона и го залепяме до ъгъла на Frame-а
			const childX = (node as SceneNode & { x: number; y: number }).x;
			const childY = (node as SceneNode & { x: number; y: number }).y;
  
			const visLeft = Math.max(0, childX);
			const visTop  = Math.max(0, childY);
  
			(node as FrameNode).resize(viewWidth, viewHeight);
			(node as SceneNode & { x: number; y: number }).x = visLeft;
			(node as SceneNode & { x: number; y: number }).y = visTop;
		  }
  
		  resolve();
		}
	  };
  
	  figma.ui.postMessage({
		bytes,
		viewWidth,
		viewHeight,
		origWidth:  originalSize.width,
		origHeight: originalSize.height,
		transform: fill.imageTransform || [[1, 0, 0], [0, 1, 0]],
		isFrameChild: !!parentNode,
		offsetX,
		offsetY,
		nodeWidth:  node.width,
		nodeHeight: node.height,
	  });
	});
  }
  
  applyRetinaCrop();