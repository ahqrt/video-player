import * as CSS from 'csstype'
import { throttle } from 'lodash-es'
import { astCompiler } from './utils/astCompiler'

declare global {
    interface Window {
        ReactNativeWebView: any
    }
}

interface BoomVideoProps {
    playerUrl: string
    autoplay?: boolean
    poster?: string
    time?: number
}

interface ChangePlayEventInfo {
    isStartPlay: boolean
    timeSeconds: number
    duration: number
}

interface SeekEventInfo {
    seekedTime:number
    videoDuration:number
    isSeeking: boolean
}

interface UpdateTimeEventInfo {
    timeSeconds: number
    duration: number
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

    /**
     * 封面
     */
    private poster: string | undefined

    /**
     * 初始定位时间
     */
    private time : number | undefined

    constructor(props:BoomVideoProps) {
        console.log(props)
        this.playerUrl = props.playerUrl
        this.autoplay = props?.autoplay || false
        this.poster = props?.poster
        this.time = props?.time
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
            this.videoElement.autoplay = this.autoplay
            if (this.poster) {
                this.videoElement.poster = this.poster
            }
            if (this.time) {
                console.log('定位时间')
                this.seekingTime(this.time)
            }
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
        videoEle.addEventListener('ended', this.handlePlayerEnd)
        videoEle.addEventListener('seeking', this.handlePlayerSeeking)
        videoEle.addEventListener('seeked', this.handlePlayerSeekEnd)
        videoEle.addEventListener('play', this.handlePlayerPlay)
        videoEle.addEventListener('pause', this.handlePlayerPause)
    }

    /**
     * 监听全屏事件处理
     * @param e
     */
    private static handleFullscreenChange(e:Event) {
        console.log('全屏切换', e)
    }

    /**
     * 监听播放结束事件处理
     */
    private handlePlayerEnd = () => {
        console.log('播放结束')
        const endInfo: ChangePlayEventInfo = {
            isStartPlay: false,
            timeSeconds: this.getPlayTime(),
            duration: this.getMediaDuration()
        }
        console.log('endInfo', endInfo)
        BoomVideoPlayer.postMessage(BoomVideoPlayer.changePlayEventInfo(endInfo))
    }

    /**
     * 监听进度条拖动开始处理
     */
    private handlePlayerSeeking = throttle(() => {
        console.log('进度条开始拖动')
        const seekingInfo:SeekEventInfo = {
            seekedTime: this.getPlayTime(),
            videoDuration: this.getMediaDuration(),
            isSeeking: true
        }
        console.log('seekingInfo', seekingInfo)

        BoomVideoPlayer.postMessage(BoomVideoPlayer.seekEventInfo(seekingInfo))
    }, 2000)

    /**
     * 监听进度条拖动结束处理
     */
    private handlePlayerSeekEnd = throttle(() => {
        console.log('进度条拖动结束')
        const seekingInfo:SeekEventInfo = {
            seekedTime: this.getPlayTime(),
            videoDuration: this.getMediaDuration(),
            isSeeking: false
        }
        console.log('seekingInfo', seekingInfo)

        BoomVideoPlayer.postMessage(BoomVideoPlayer.seekEventInfo(seekingInfo))
    }, 2000)

    /**
     * 监听开始播放处理
     */
    private handlePlayerPlay = () => {
        console.log('开始播放')
        const playInfo:ChangePlayEventInfo = {
            isStartPlay: true,
            timeSeconds: this.getPlayTime(),
            duration: this.getMediaDuration()
        }
        console.log('play info', playInfo)
        BoomVideoPlayer.postMessage(BoomVideoPlayer.changePlayEventInfo(playInfo))
    }

    /**
     * 监听暂停播放处理
     */
    private handlePlayerPause = () => {
        console.log('暂停')
        const pauseInfo: ChangePlayEventInfo = {
            isStartPlay: false,
            timeSeconds: this.getPlayTime(),
            duration: this.getMediaDuration()

        }
        console.log('pauseInfo', pauseInfo)
        BoomVideoPlayer.postMessage(BoomVideoPlayer.changePlayEventInfo(pauseInfo))
    }

    /**
     * 监听视频播放进度处理函数
     */
    private handleTimeUpdate = throttle(() => {
        console.log('视频播放进度', this.videoElement?.currentTime)
        this.currentPlayTime = this.getPlayTime()
        const updateTimeInfo:UpdateTimeEventInfo = {
            timeSeconds: this.getPlayTime(),
            duration: this.getMediaDuration()
        }
        console.log('updateTimeInfo', updateTimeInfo)
        BoomVideoPlayer.postMessage(BoomVideoPlayer.updateTimeEventInfo(updateTimeInfo))
    }, 1000)

    /** ß
     * 处理传入时间的处理
     * @param {Number} time 传入定位的时间戳
     */
    seekingTime(time: number) {
        this.videoElement!.currentTime = time
    }

    /**
     * 获取播放进度
     */
    private getPlayTime = () => this.videoElement!.currentTime

    /**
     * 给rn端和iframe端推送消息
     * @param message
     */
    private static postMessage = <T>(message: T) => {
        // 添加react Native 的事件信息处理
        // eslint-disable-next-line @typescript-eslint/no-unused-expressions
        window.ReactNativeWebView && window.ReactNativeWebView.postMessage(JSON.stringify(message))
        window.parent.postMessage(JSON.stringify(message), '*')
    }

    /**
     * 获取当前视频的时长
     */
    private getMediaDuration = () => this.videoElement!.duration

    /**
     * 生成changePlayEvent播放状态改变的信息
     * @param isStartPlay
     * @param timeSeconds
     * @param duration
     * @returns
     */
    private static changePlayEventInfo = (props:ChangePlayEventInfo) => ({
        startPlay: props.isStartPlay,
        timeSeconds: props.timeSeconds,
        duration: props.duration,
        type: 'changePlayEvent'
    })

    /**
     * 生成 seekEvent 对应的info信息
     * @param {SeekEventInfo} props
     * @returns
     */
    private static seekEventInfo = (props: SeekEventInfo) => ({
        seekTime: props.seekedTime,
        duration: props.videoDuration,
        isSeeking: props.isSeeking,
        type: 'seekEvent'
    })

    /**
     * 生成 updateTimeEvent 对应的info信息
     * @param props
     * @returns
     */
    private static updateTimeEventInfo = (props: UpdateTimeEventInfo) => ({
        timeSeconds: props.timeSeconds,
        duration: props.duration,
        type: 'updateTimeEvent'
    })
}

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
window.BoomVideoPlayer = BoomVideoPlayer
export default BoomVideoPlayer
