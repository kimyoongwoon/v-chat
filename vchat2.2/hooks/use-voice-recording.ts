import { useState, useRef, useCallback } from 'react'
import { AUDIO_CONFIG } from '@/components/chat-config'
import type { STTResponse } from '@/components/chat-config'

export function useVoiceRecording() {
  const [isRecording, setIsRecording] = useState(false)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])

  const uploadAudioForTranscription = useCallback(async (audioBlob: Blob): Promise<string | null> => {
    try {
      console.log('🎤 음성 파일 업로드 시작:', audioBlob.size, 'bytes')
      
      const formData = new FormData()
      formData.append('file', audioBlob, 'recording.webm')
      
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'
      
      const response = await fetch(`${backendUrl}/api/speech/upload`, {
        method: 'POST',
        body: formData,
      })
      
      const data: STTResponse = await response.json()
      console.log('📝 STT 결과:', data)
      
      if (data.success && data.transcription) {
        console.log('✅ 음성 인식 성공:', data.transcription)
        return data.transcription
      } else {
        console.error("음성 인식 실패:", data)
        return null
      }
    } catch (error) {
      console.error("음성 업로드 오류:", error)
      return null
    }
  }, [])

  const startRecording = useCallback(async (): Promise<boolean> => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          sampleRate: AUDIO_CONFIG.SAMPLE_RATE,
          channelCount: AUDIO_CONFIG.CHANNEL_COUNT,
          echoCancellation: true,
          noiseSuppression: true
        } 
      })
      
      audioChunksRef.current = []
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: AUDIO_CONFIG.MIME_TYPE
      })
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }
      
      mediaRecorderRef.current = mediaRecorder
      mediaRecorder.start(AUDIO_CONFIG.RECORDING_INTERVAL_MS)
      setIsRecording(true)
      
      return true
    } catch (error) {
      console.error("마이크 접근 권한이 필요합니다:", error)
      alert("마이크 접근 권한을 허용해주세요.")
      return false
    }
  }, [])

  const stopRecording = useCallback(async (): Promise<string | null> => {
    return new Promise((resolve) => {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
        mediaRecorderRef.current.onstop = async () => {
          // 스트림 정리
          const stream = mediaRecorderRef.current?.stream
          if (stream) {
            stream.getTracks().forEach(track => track.stop())
          }
          
          if (audioChunksRef.current.length > 0) {
            const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
            const transcription = await uploadAudioForTranscription(audioBlob)
            resolve(transcription)
          } else {
            resolve(null)
          }
        }
        
        mediaRecorderRef.current.stop()
        setIsRecording(false)
      } else {
        setIsRecording(false)
        resolve(null)
      }
    })
  }, [uploadAudioForTranscription])

  const toggleRecording = useCallback(async (): Promise<string | null> => {
    if (isRecording) {
      return await stopRecording()
    } else {
      const success = await startRecording()
      return success ? null : "녹음 시작 실패"
    }
  }, [isRecording, startRecording, stopRecording])

  return {
    isRecording,
    toggleRecording,
    startRecording,
    stopRecording
  }
} 