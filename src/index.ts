import * as CSS from 'csstype'
import { astCompiler } from './utils/astCompiler'

interface BoomVideoProps {
    playerUrl: string
    autoplay?: boolean
}
class BoomVideoPlayer {
    /**
     * 创建的播放器元素
     * @private
     */
    private videoElement: null | HTMLVideoElement

    /**
     * 播放地址url
     * @private
     */
    private readonly playerUrl: string

    /**
     * 是否是自动播放
     * @private
     */
    private readonly autoplay: boolean

    /**
     * 当前播放的进度时间
     * @private
     */
    private currentPlayTime: number

    constructor(props:BoomVideoProps) {
        console.log(props)
        this.playerUrl = props.playerUrl
        this.autoplay = props?.autoplay || false
        this.videoElement = null
        this.currentPlayTime = 0
    }

    /**
     * 创建播放器ui
     * @param {HTMLDivElement} container 传入的外层div容器
     */
    createGUI(container:HTMLDivElement) {
        const videoStyle:CSS.Properties = {
            width: '100%',
            height: '100%'
        }
        const videoPlayer = astCompiler<HTMLVideoElement>('video', { attr: { type: 'style', content: videoStyle } })
        videoPlayer.controls = true
        videoPlayer.autoplay = this.autoplay
        this.videoElement = videoPlayer
        this.addVideoEventListener(this.videoElement)
        container.appendChild(videoPlayer)
    }

    /**
     * 初始化播放器参数
     */
    initPlayer() {
        if (this.videoElement) {
            this.videoElement.src = this.playerUrl
        }
    }

    /**
     * 播放
     */
    play() {
        this.videoElement?.play()
    }

    /**
     * 暂停播放
     */
    pause() {
        this.videoElement?.pause()
    }

    /**
     * 给video标签添加监听事件
     * @param {HTMLVideoElement} videoEle
     */
    private addVideoEventListener(videoEle: HTMLVideoElement) {
        videoEle.addEventListener('timeupdate', this.handleTimeUpdate)
        videoEle.addEventListener('fullscreenchange', BoomVideoPlayer.handleFullscreenChange)
    }

    private static handleFullscreenChange(e:Event) {
        console.log('全屏切换', e)
    }

    /**
     * 视频播放进度监听处理函数
     */
    private handleTimeUpdate = () => {
        console.log('视频播放进度', this.videoElement?.currentTime)
        this.currentPlayTime = this.videoElement?.currentTime as number
    }

    /**
     * 处理传入时间的处理
     * @param {Number} time 传入定位的时间戳
     */
    seekingTime(time: number) {
        this.videoElement!.currentTime = time
    }
}

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
window.BoomVideoPlayer = BoomVideoPlayer
export default BoomVideoPlayer
