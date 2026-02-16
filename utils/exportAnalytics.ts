/**
 * Triggers a browser download of the analytics data in JSON format.
 * @param {StoryStats} stats - The analytics data to be exported.
 */
export const downloadAnalyticsJSON = (stats: any) => {
  const blob = new Blob([JSON.stringify(stats, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const downloadAnchorNode = document.createElement('a');
  downloadAnchorNode.setAttribute("href", url);
  downloadAnchorNode.setAttribute("download", "groqtales_analytics.json");
  document.body.appendChild(downloadAnchorNode);
  downloadAnchorNode.click();
  downloadAnchorNode.remove();
  URL.revokeObjectURL(url);
};