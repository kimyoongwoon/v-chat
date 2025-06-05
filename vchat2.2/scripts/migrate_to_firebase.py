"""
로컬 personas.json 데이터를 Firebase Firestore로 마이그레이션하는 스크립트
"""

import sys
import os

# 프로젝트 루트 디렉토리를 Python 경로에 추가
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

from modules.persona_manager import PersonaManager

def main():
    """마이그레이션 실행"""
    print("🔄 Firebase 마이그레이션 시작")
    print("=" * 50)
    
    # 먼저 로컬 파일 존재 여부 확인
    personas_file = 'data/personas.json'
    if not os.path.exists(personas_file):
        print(f"❌ 로컬 페르소나 파일을 찾을 수 없습니다: {personas_file}")
        return False
    
    # PersonaManager 초기화 (자동 로드 비활성화)
    print("🔧 PersonaManager 초기화 중 (자동 로드 비활성화)...")
    persona_manager = PersonaManager(auto_load=False)
    
    # Firebase 연결 확인
    if not persona_manager.db:
        print("❌ Firebase 연결이 설정되지 않았습니다.")
        print("💡 환경 변수를 확인하고 Firebase 설정을 완료해주세요.")
        return False
    
    print("✅ Firebase 연결 확인됨")
    
    # 마이그레이션 실행
    success = persona_manager.migrate_local_to_firebase()
    
    if success:
        print("\n🎉 마이그레이션 완료!")
        print("✅ 이제 Firebase에서 페르소나 데이터를 관리할 수 있습니다.")
        
        # 결과 확인
        personas = persona_manager.get_available_personas()
        print(f"📊 총 {len(personas)}개의 페르소나가 Firebase에 저장되었습니다:")
        for persona in personas:
            print(f"  - {persona}")
            
    else:
        print("\n❌ 마이그레이션 실패")
        print("💡 로그를 확인하고 문제를 해결해주세요.")
    
    return success

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n\n👋 마이그레이션이 중단되었습니다.")
    except Exception as e:
        print(f"\n❌ 예상치 못한 오류: {str(e)}")
