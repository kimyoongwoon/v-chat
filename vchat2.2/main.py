# ==========================================
# main.py - 통합 음성 채팅 시스템 (페르소나 선택 지원)
# ==========================================

import os
import sys
from dotenv import load_dotenv

# modules 폴더를 Python 경로에 추가
sys.path.append(os.path.join(os.path.dirname(__file__), 'modules'))

# # 패키지 의존성 확인 및 설치
# try:
#     from modules.package_manager import check_and_install_dependencies, verify_critical_imports
    
#     # 1. 패키지 의존성 확인 및 설치 (조용히)
#     if not check_and_install_dependencies():
#         print("❌ 필수 패키지 설치 실패. 수동 설치 필요: pip install -r requirements.txt")
#         sys.exit(1)
    
#     # 2. 핵심 모듈 import 테스트 (조용히)
#     verify_critical_imports()

# except ImportError:
#     pass  # 패키지 관리자 없이 진행
# except Exception:
#     pass  # 에러 무시하고 진행

# 메인 모듈들 import
try:
    from modules.stt_service import RealTimeSTT
    from modules.tts_service import VoiceConverter
    from modules.audio_utils import AudioConfig
    from modules.vchat_bot import VChatBot
    from modules.persona_manager import PersonaManager
    print("✅ 모든 모듈 로드 완료")
except ImportError as e:
    print(f"❌ 모듈 로드 실패: {str(e)}")
    sys.exit(1)

# .env 파일 로드
load_dotenv()

class VoiceChatSystem:
    """음성 채팅 시스템"""
    
    def __init__(self):
        self.persona_manager = PersonaManager()
        self.stt_service = None
        self.tts_service = None
        self.chatbot = None
        self.current_persona_name = None
    
    def select_persona(self):
        """페르소나 선택 또는 생성"""
        available_personas = self.persona_manager.get_available_personas()
        
        if not available_personas:
            print("❌ 사용 가능한 페르소나가 없습니다.")
            print("💡 새로운 페르소나를 생성해보세요.")
            return self.create_new_persona()
        
        print("\n🎭 사용 가능한 페르소나:")
        print("=" * 30)
        for i, persona_name in enumerate(available_personas, 1):
            print(f"  {i}. {persona_name}")
        print(f"  {len(available_personas) + 1}. 새로운 페르소나 생성")
        print("=" * 30)
        
        while True:
            try:
                choice = input(f"페르소나를 선택하세요 (1-{len(available_personas) + 1}): ").strip()
                choice_idx = int(choice) - 1
                
                if choice_idx == len(available_personas):
                    # 새로운 페르소나 생성
                    return self.create_new_persona()
                elif 0 <= choice_idx < len(available_personas):
                    selected_persona = available_personas[choice_idx]
                    
                    if self.persona_manager.select_persona(selected_persona):
                        self.current_persona_name = selected_persona
                        print(f"✅ '{selected_persona}' 페르소나가 선택되었습니다!")
                        return True
                    else:
                        print("❌ 페르소나 선택에 실패했습니다.")
                        return False
                else:
                    print(f"❗ 1-{len(available_personas) + 1} 사이의 숫자를 입력하세요.")
                    
            except ValueError:
                print("❗ 올바른 숫자를 입력하세요.")
            except KeyboardInterrupt:
                return False
    
    def create_new_persona(self):
        """새로운 페르소나 생성"""
        try:
            print("\n🎨 새로운 페르소나 생성")
            print("=" * 30)
            
            # 이름 입력
            while True:
                name = input("페르소나 이름을 입력하세요: ").strip()
                if name:
                    # 이미 존재하는 이름인지 확인
                    if name in self.persona_manager.get_available_personas():
                        print(f"❌ '{name}' 페르소나가 이미 존재합니다.")
                        continue
                    break
                else:
                    print("❗ 이름을 입력해주세요.")
            
            # URL 입력
            while True:
                url = input("페르소나 정보가 있는 URL을 입력하세요: ").strip()
                if url:
                    if not url.startswith(('http://', 'https://')):
                        url = 'https://' + url
                    break
                else:
                    print("❗ URL을 입력해주세요.")
            
            print("\n🔧 추가 설정 (선택사항)")
            print("=" * 30)
            
            # Voice ID 입력 (선택사항)
            voice_id = input("Voice ID (엔터: 기본값 사용): ").strip()
            if not voice_id:
                voice_id = "HAIQu18Se8Zljrot4frx"
                print(f"✅ 기본 Voice ID 사용")
            else:
                print(f"✅ 사용자 지정 Voice ID: {voice_id}")
            
            # Fine-tuned Model ID 입력 (선택사항)
            model_id = input("Model ID (엔터: 기본값 사용): ").strip()
            if not model_id:
                model_id = "ft:gpt-4o-mini-2024-07-18:session12::BdvAqZdI"
                print(f"✅ 기본 Model ID 사용")
            else:
                print(f"✅ 사용자 지정 Model ID: {model_id}")
            
            # 생성 확인
            print(f"\n📋 페르소나 생성 정보 확인")
            print("=" * 30)
            print(f"이름: {name}")
            print(f"URL: {url}")
            print(f"Voice ID: {voice_id}")
            print(f"Model ID: {model_id}")
            print("=" * 30)
            
            confirm = input("이 설정으로 페르소나를 생성하시겠습니까? (y/n): ").strip().lower()
            
            if confirm not in ['y', 'yes', '예']:
                print("❌ 페르소나 생성이 취소되었습니다.")
                return False
            
            print(f"\n🔄 '{name}' 페르소나를 생성하는 중...")
            print("⏳ 웹페이지 분석 및 페르소나 데이터 생성 중... (시간이 걸릴 수 있습니다)")
            
            # 페르소나 생성 (voice_id와 model_id 전달)
            if self.persona_manager.add_persona_from_url(name, url, voice_id, model_id):
                # 생성된 페르소나 선택
                if self.persona_manager.select_persona(name):
                    self.current_persona_name = name
                    print(f"✅ '{name}' 페르소나가 성공적으로 생성되고 선택되었습니다!")
                    return True
                else:
                    print("❌ 생성된 페르소나 선택에 실패했습니다.")
                    return False
            else:
                print("❌ 페르소나 생성에 실패했습니다.")
                return False
                
        except KeyboardInterrupt:
            print("\n❌ 페르소나 생성이 중단되었습니다.")
            return False
        except Exception as e:
            print(f"❌ 페르소나 생성 중 오류: {str(e)}")
            return False

    def initialize_services(self):
        """선택된 페르소나로 모든 서비스 초기화"""
        try:
            if not self.persona_manager.get_current_persona():
                print("❌ 페르소나가 선택되지 않았습니다.")
                return False
            
            # 오디오 설정
            audio_config = AudioConfig()
            
            # STT 서비스 초기화
            self.stt_service = RealTimeSTT(
                silence_threshold=2.0,
                sample_rate=audio_config.sample_rate,
                chunk_size=audio_config.chunk_size
            )
            
            # TTS 서비스 초기화 (페르소나 정보 전달)
            self.tts_service = VoiceConverter(persona_manager=self.persona_manager)
            
            # VChat 챗봇 초기화 (페르소나 정보 전달)
            self.chatbot = VChatBot(persona_manager=self.persona_manager)
            
            print(f"✅ '{self.current_persona_name}' 페르소나로 시스템 초기화 완료")
            return True
            
        except Exception as e:
            print(f"❌ 서비스 초기화 실패: {str(e)}")
            print("💡 .env 파일에 API 키가 올바르게 설정되어 있는지 확인해주세요.")
            return False
    
    def voice_to_voice_response(self):
        """음성 입력 → AI 응답 → 음성 출력"""
        try:
            # 1. 음성 인식
            print("🎤 음성 인식 중... (2초 침묵 또는 Enter로 중단)")
            recognized_text = self.stt_service.record_and_transcribe()
            
            if not recognized_text or not recognized_text.strip():
                print("❌ 음성을 인식하지 못했습니다.")
                return False
            
            print(f"📝 인식: {recognized_text}")
            
            # 2. AI 응답 생성 (조용히)
            ai_response = self.chatbot.get_response(recognized_text)
            print(f"💭 응답: {ai_response}")
            
            # 3. TTS로 음성 변환 및 재생 (조용히)
            print("🔊 음성 재생 중...")
            success = self.tts_service.convert_and_play(ai_response)
            
            return success
            
        except Exception as e:
            print(f"❌ 음성 대화 중 오류: {str(e)}")
            return False
    
    def text_to_voice_response(self, text):
        """텍스트 입력 → AI 응답 → 음성 출력"""
        try:
            if not text or not text.strip():
                return False
            
            # AI 응답 생성 (조용히)
            ai_response = self.chatbot.get_response(text)
            print(f"💭 응답: {ai_response}")
            
            # TTS로 음성 변환 및 재생 (조용히)
            print("🔊 음성 재생 중...")
            success = self.tts_service.convert_and_play(ai_response)
            
            return success
            
        except Exception as e:
            print(f"❌ 텍스트 대화 중 오류: {str(e)}")
            return False
    
    def get_text_response(self, text):
        """텍스트 입력 → AI 텍스트 응답만 반환"""
        try:
            if not text or not text.strip():
                return ""
            
            # AI 응답 생성 (조용히)
            ai_response = self.chatbot.get_response(text)
            return ai_response
            
        except Exception as e:
            print(f"❌ 응답 생성 중 오류: {str(e)}")
            return "아 미안, 지금 잠깐 말이 안 나오네 ㅋㅋ 다시 말해줘!"
    
    def cleanup(self):
        """자원 정리"""
        try:
            if self.stt_service:
                self.stt_service.terminate()
        except:
            pass

def main():
    """
    메인 함수 - 페르소나 선택 및 다양한 모드 지원
    """
    print("🎯 VChat 음성 채팅 시스템")
    print("=" * 40)
    
    # 시스템 생성
    voice_system = VoiceChatSystem()
    
    # 페르소나 선택 또는 생성
    if not voice_system.select_persona():
        print("👋 프로그램을 종료합니다.")
        return
    
    # 서비스 초기화
    if not voice_system.initialize_services():
        print("👋 프로그램을 종료합니다.")
        return
    
    print("\n" + "=" * 40)
    print(" v + Enter → 음성 대화 (음성→음성)")
    print(" t + Enter → 텍스트 대화 (텍스트→음성)")
    print(" c + Enter → 순수 텍스트 채팅")
    print(" p + Enter → 페르소나 변경")
    print(" n + Enter → 새 페르소나 생성")
    print(" q + Enter → 종료")
    print("=" * 40)
    
    try:
        # 모드 선택 (한 번만)
        while True:
            cmd = input(f"\n[{voice_system.current_persona_name}] 명령을 선택하세요 (v/t/c/p/n/q): ").strip().lower()
            
            if cmd == "v":
                # 음성 → 음성 모드
                print(f"\n🎤 [{voice_system.current_persona_name}] 음성 대화 모드")
                print("음성 대화를 시작합니다! 종료하려면 Ctrl+C를 누르세요.")
                print("=" * 50)
                
                try:
                    while True:
                        print("\n🎤 다음 음성 입력을 기다리는 중...")
                        voice_system.voice_to_voice_response()
                        print("=" * 50)
                        # 자동으로 다음 입력으로 넘어감 (Enter 입력 불필요)
                        
                except KeyboardInterrupt:
                    # 종료 메시지 음성 출력
                    print("\n\n🔄 종료 중...")
                    goodbye_message = "벌써 가는거야~? 너무 아쉬운데... 그래도 담에 또 놀러와!"
                    print(f"💭 {goodbye_message}")
                    voice_system.tts_service.convert_and_play(goodbye_message)
                    print("👋 프로그램을 종료합니다.")
                    return
                
            elif cmd == "t":
                # 텍스트 → 음성 모드
                print(f"\n💬 [{voice_system.current_persona_name}] 텍스트 → 음성 모드")
                print("대화를 시작합니다! 종료하려면 'q'를 입력하세요.")
                
                while True:
                    user_text = input("입력: ").strip()
                    
                    if user_text.lower() == 'q':
                        # 종료 메시지 음성 출력
                        goodbye_message = "벌써 가는거야~? 너무 아쉬운데... 그래도 담에 또 놀러와!"
                        print(f"💭 {goodbye_message}")
                        voice_system.tts_service.convert_and_play(goodbye_message)
                        print("👋 프로그램을 종료합니다.")
                        return
                    
                    if user_text:
                        voice_system.text_to_voice_response(user_text)
                
            elif cmd == "c":
                # 순수 텍스트 채팅 모드
                print(f"\n💬 [{voice_system.current_persona_name}] 순수 텍스트 채팅 모드")
                print("대화를 시작합니다! 종료하려면 'q'를 입력하세요.")
                
                while True:
                    user_text = input("입력: ").strip()
                    
                    if user_text.lower() == 'q':
                        # 종료 메시지 텍스트만 출력
                        goodbye_message = "벌써 가는거야~? 너무 아쉬운데... 그래도 담에 또 놀러와!"
                        print(f"[{voice_system.current_persona_name}]: {goodbye_message}")
                        print("👋 프로그램을 종료합니다.")
                        return
                    
                    if user_text:
                        response = voice_system.get_text_response(user_text)
                        print(f"[{voice_system.current_persona_name}]: {response}")
            
            elif cmd == "p":
                # 페르소나 변경
                print(f"\n🎭 페르소나 변경")
                if voice_system.select_persona():
                    if voice_system.initialize_services():
                        print("✅ 페르소나 변경 완료!")
                        print("새로운 페르소나로 다시 모드를 선택해주세요.")
                        # 모드 선택으로 돌아가기
                        continue
                    else:
                        print("❌ 페르소나 변경 실패")
                        return
                else:
                    return
            
            elif cmd == "n":
                # 새 페르소나 생성
                print(f"\n🎨 새 페르소나 생성")
                if voice_system.create_new_persona():
                    if voice_system.initialize_services():
                        print("✅ 새 페르소나 생성 및 적용 완료!")
                        print("새로운 페르소나로 다시 모드를 선택해주세요.")
                        # 모드 선택으로 돌아가기
                        continue
                    else:
                        print("❌ 새 페르소나 적용 실패")
                        return
                else:
                    return
                
            elif cmd == "q":
                # 종료 메시지 음성 출력
                goodbye_message = "벌써 가는거야~? 너무 아쉬운데... 그래도 담에 또 놀러와!"
                print(f"💭 {goodbye_message}")
                voice_system.tts_service.convert_and_play(goodbye_message)
                print("👋 프로그램을 종료합니다.")
                break
            else:
                print("❗ v, t, c, p, n, 또는 q를 입력하세요.")
                
    except KeyboardInterrupt:
        print("\n\n👋 프로그램이 중단되었습니다.")
    except Exception as e:
        print(f"\n❌ 예상치 못한 오류: {str(e)}")
    finally:
        voice_system.cleanup()

if __name__ == "__main__":
    main()
