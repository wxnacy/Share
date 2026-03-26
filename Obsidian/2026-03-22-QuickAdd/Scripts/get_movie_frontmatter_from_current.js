module.exports = async (params) => {
    const { app, quickAddApi } = params;

    // 1. 获取当前活动文件
    const activeFile = app.workspace.getActiveFile();
    if (!activeFile) {
        new Notice("⚠️ 请先打开一个包含属性的笔记！");
        throw new Error("No active file");
    }

    // 2. 读取文件的 Frontmatter (YAML 属性)
    let fileMetadata = {};
    await app.fileManager.processFrontMatter(activeFile, (frontmatter) => {
        // 将 frontmatter 对象复制一份，避免直接修改原文件
        fileMetadata = { ...frontmatter };
    });

    // 3. 从属性中提取所需的字段
    const title = fileMetadata['片名'] || fileMetadata['标题'];
    const dateValue = fileMetadata['上映日期'] || fileMetadata['出版日期'] || "";
    const year = (dateValue || "").match(/\d{4}/)?.[0];
    const type = fileMetadata['内容类型'];

    // 4.【新增】检查所有必需的字段是否都存在
    const missingFields = [];
    if (!title) {
        missingFields.push("标题(或片名)");
    }
    if (!year) {
        missingFields.push("年份(从'上映日期'或'出版日期')");
    }
    if (!type) {
        missingFields.push("内容类型");
    }

    // 如果有字段缺失，则报错并停止
    if (missingFields.length > 0) {
        const errorMessage = `🛑 缺少必要的属性: ${missingFields.join(', ')}`;
        new Notice(errorMessage);
        throw new Error(errorMessage);
    }

    // 5. 将提取的值赋给 QuickAdd 的变量
    params.variables.title = title;
    params.variables.year = year;
    params.variables.type = type;

    // 6. 显示一个提示，确认提取成功
    new Notice(`✅ 已提取: ${title} | ${year} | ${type}`);
};

