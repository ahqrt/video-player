import { throttle } from 'lodash-es'
import Player from 'xgplayer'

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
    noSlider?: boolean
    canDBSpeed?: boolean
    noFullscreen?: boolean
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

    /**
     * 是否不展示进度条
     */
    private noSlider : boolean | undefined

    /**
     * 是否不展示全屏按钮
     */
    private noFullscreen: boolean | undefined

    /**
     * 播放器实例
     */
    private videoPlayer: Player | undefined

    private canDBSpeed: boolean | undefined

    constructor(props:BoomVideoProps) {
        console.log(props)
        this.playerUrl = props.playerUrl
        this.autoplay = props?.autoplay || false
        this.poster = props?.poster
        this.time = props?.time
        this.noSlider = props?.noSlider
        this.canDBSpeed = props?.canDBSpeed || false
        this.noFullscreen = props?.noFullscreen || false
        this.currentPlayTime = 0
    }

    /**
     * 初始化播放器参数
     */
    initPlayer(containerId: string) {
        const ignoresList = () => {
            const renderList = new Set(['download'])
            if (this.noFullscreen) {
                renderList.add('fullscreen')
            }
            if (this.noSlider) {
                renderList.add('progress')
            }
            if (!this.canDBSpeed) {
                renderList.add('playbackRate')
            }
            console.log('Array.from(renderList)', Array.from(renderList))
            return Array.from(renderList) as any
        }
        const player = new Player({
            el: document.getElementById(containerId) as HTMLDivElement,
            url: this.playerUrl,
            poster: this.poster,
            videoInit: true,
            playbackRate: [0.25, 0.5, 1, 1.5, 2],
            lastPlayTime: this.time || 0,
            playsinline: true,
            ignores: ignoresList(),
            fluid: true
        })

        console.log('播放器初始化完毕')
        this.videoPlayer = player
        this.addVideoEventListener(this.videoPlayer)
    }

    /**
     * 播放
     */
    play() {
        this.videoPlayer?.play()
    }

    /**
     * 暂停播放
     */
    pause() {
        this.videoPlayer?.pause()
    }

    /**
     * 给video标签添加监听事件
     * @param {HTMLVideoElement} videoEle
     */
    private addVideoEventListener(videoEle: Player) {
        videoEle.on('timeupdate', this.handleTimeUpdate)
        videoEle.on('fullscreenchange', BoomVideoPlayer.handleFullscreenChange)
        videoEle.on('ended', this.handlePlayerEnd)
        videoEle.on('seeking', this.handlePlayerSeeking)
        videoEle.on('seeked', this.handlePlayerSeekEnd)
        videoEle.on('play', this.handlePlayerPlay)
        videoEle.on('pause', this.handlePlayerPause)
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
            timeSeconds: this.getMediaDuration(),
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
        this.currentPlayTime = this.getPlayTime()
        const updateTimeInfo:UpdateTimeEventInfo = {
            timeSeconds: this.getPlayTime(),
            duration: this.getMediaDuration()
        }
        console.log('updateTimeInfo', updateTimeInfo)
        BoomVideoPlayer.postMessage(BoomVideoPlayer.updateTimeEventInfo(updateTimeInfo))
    }, 1000)

    /**
     * 获取播放进度
     */
    private getPlayTime = () => this.videoPlayer!.currentTime

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
    private getMediaDuration = () => this.videoPlayer!.duration

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
