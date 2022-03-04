import { createDom, createImgBtn } from 'xgplayer/src/utils/util'
import RequestFullIcon from '../assets/requestFull.svg'
import ExitFullIcon from '../assets/exitFull.svg'
import '../style/controls/fullscreen.scss'
import sniffer from 'xgplayer/src/utils/sniffer'

console.log('sniffer.os', sniffer.os);

export const isFullScreen = {
    isFullScreen: false
}

const sendIOSIsFullScreenMessage = (message) => {
    window?.webkit?.messageHandlers?.changeScreen?.postMessage(message)
    window?.webkit?.messageHandlers?.message?.postMessage(message)
    window?.ReactNativeWebView?.postMessage(JSON.stringify({ isFullScreen: message, type: 'fullscreenEvent' }))
}


let s_fullscreen = function () {
  let player = this
  let fullscreenBtn = player.config.fullscreenBtn ? player.config.fullscreenBtn : {}
  let btn
  if (fullscreenBtn.type === 'img') {
    btn = createImgBtn('fullscreen', fullscreenBtn.url.request, fullscreenBtn.width, fullscreenBtn.height)
  } else {
    btn = createDom('xg-fullscreen', `<xg-icon class="xgplayer-icon">
                                             <div class="xgplayer-icon-requestfull">${RequestFullIcon}</div>
                                             <div class="xgplayer-icon-exitfull">${ExitFullIcon}</div>
                                           </xg-icon>`, {}, 'xgplayer-fullscreen')
  }

  let tipsText = {}
  tipsText.requestfull = player.lang.FULLSCREEN_TIPS
  tipsText.exitfull = player.lang.EXITFULLSCREEN_TIPS
  let tips = createDom('xg-tips', `<span class="xgplayer-tip-requestfull">${tipsText.requestfull}</span>
                                        <span class="xgplayer-tip-exitfull">${tipsText.exitfull}</span>`, {}, 'xgplayer-tips')
  btn.appendChild(tips)
  player.once('ready', () => {
    if(player.controls) {
      player.controls.appendChild(btn)
    }
  });

  ['click', 'touchend'].forEach(item => {
    btn.addEventListener(item, function (e) {
      e.preventDefault()
      e.stopPropagation()
      console.log('点击了全屏处理按钮');
      if(sniffer.os.isPhone) {
        if(isFullScreen.isFullScreen) {
            sendIOSIsFullScreenMessage(false)
        }else {
            sendIOSIsFullScreenMessage(true)
        }
        isFullScreen.isFullScreen = !isFullScreen.isFullScreen
      }else {
        player.userGestureTrigEvent('fullscreenBtnClick')
      }
    })
  })
}

export default {
  name: 's_fullscreen',
  method: s_fullscreen
}
