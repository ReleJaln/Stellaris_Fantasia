GameGlobal.canvas = wx.createCanvas();
if (typeof wx.getDeviceInfo().platform === 'android' || wx.getDeviceInfo().platform === 'ios') {
  // 真机环境下禁用性能监控
  wx.setEnableDebug({ enableDebug: false });
}
const windowInfo = wx.getWindowInfo ? wx.getWindowInfo() : wx.getDeviceInfo();

canvas.width = windowInfo.screenWidth;
canvas.height = windowInfo.screenHeight;

export const SCREEN_WIDTH = windowInfo.screenWidth;

export const SCREEN_HEIGHT = windowInfo.screenHeight;