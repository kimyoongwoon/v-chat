"""
패키지 자동 설치 및 관리 모듈
requirements.txt를 확인하고 누락된 패키지를 자동 설치
"""

import subprocess
import sys
import os
import importlib
import pkg_resources
from pathlib import Path

class PackageManager:
    """패키지 설치 및 관리 클래스"""
    
    def __init__(self, requirements_file="requirements.txt"):
        self.requirements_file = requirements_file
        self.failed_packages = []
        self.installed_packages = []
    
    def parse_requirements(self):
        """
        requirements.txt 파일을 파싱하여 패키지 목록 반환
        
        Returns:
            list: 패키지 목록 [(패키지명, 버전), ...]
        """
        if not os.path.exists(self.requirements_file):
            print(f"❌ {self.requirements_file} 파일을 찾을 수 없습니다.")
            return []
        
        packages = []
        
        try:
            with open(self.requirements_file, 'r', encoding='utf-8') as f:
                lines = f.readlines()
            
            for line in lines:
                line = line.strip()
                
                # 주석이나 빈 줄 건너뛰기
                if not line or line.startswith('#'):
                    continue
                
                # 패키지명과 버전 분리
                if '>=' in line:
                    package_name, version = line.split('>=')
                    packages.append((package_name.strip(), version.strip()))
                elif '==' in line:
                    package_name, version = line.split('==')
                    packages.append((package_name.strip(), version.strip()))
                else:
                    # 버전 정보 없는 경우
                    packages.append((line.strip(), None))
            
            return packages
            
        except Exception as e:
            print(f"❌ requirements.txt 파싱 오류: {str(e)}")
            return []
    
    def is_package_installed(self, package_name):
        """
        패키지가 설치되어 있는지 확인
        
        Args:
            package_name (str): 패키지명
            
        Returns:
            bool: 설치 여부
        """
        try:
            # 패키지명 정규화 (하이픈을 언더스코어로)
            normalized_name = package_name.replace('-', '_').replace('_', '-')
            
            # 여러 방법으로 확인
            try:
                __import__(package_name)
                return True
            except ImportError:
                pass
            
            try:
                __import__(normalized_name)
                return True
            except ImportError:
                pass
            
            # pkg_resources로 확인
            try:
                pkg_resources.get_distribution(package_name)
                return True
            except pkg_resources.DistributionNotFound:
                pass
            
            try:
                pkg_resources.get_distribution(normalized_name)
                return True
            except pkg_resources.DistributionNotFound:
                pass
            
            return False
            
        except Exception:
            return False
    
    def install_package(self, package_name, version=None):
        """
        패키지 설치
        
        Args:
            package_name (str): 패키지명
            version (str, optional): 버전 정보
            
        Returns:
            bool: 설치 성공 여부
        """
        try:
            if version:
                package_spec = f"{package_name}>={version}"
            else:
                package_spec = package_name
            
            print(f"📦 {package_spec} 설치 중...")
            
            # pip install 실행
            result = subprocess.run([
                sys.executable, '-m', 'pip', 'install', package_spec
            ], capture_output=True, text=True, timeout=300)
            
            if result.returncode == 0:
                print(f"✅ {package_name} 설치 완료!")
                self.installed_packages.append(package_name)
                return True
            else:
                print(f"❌ {package_name} 설치 실패:")
                print(f"   {result.stderr}")
                self.failed_packages.append(package_name)
                return False
                
        except subprocess.TimeoutExpired:
            print(f"⏰ {package_name} 설치 시간 초과")
            self.failed_packages.append(package_name)
            return False
        except Exception as e:
            print(f"❌ {package_name} 설치 중 오류: {str(e)}")
            self.failed_packages.append(package_name)
            return False
    
    def check_and_install_packages(self):
        """
        requirements.txt의 모든 패키지를 확인하고 누락된 것들을 설치
        
        Returns:
            bool: 모든 패키지 설치 성공 여부
        """
        print("🔍 패키지 의존성을 확인하는 중...")
        
        packages = self.parse_requirements()
        if not packages:
            print("📦 확인할 패키지가 없습니다.")
            return True
        
        missing_packages = []
        
        # 설치 여부 확인
        for package_name, version in packages:
            if not self.is_package_installed(package_name):
                missing_packages.append((package_name, version))
                print(f"❌ {package_name} - 설치되지 않음")
            else:
                print(f"✅ {package_name} - 이미 설치됨")
        
        if not missing_packages:
            print("🎉 모든 패키지가 이미 설치되어 있습니다!")
            return True
        
        print(f"\n📋 {len(missing_packages)}개의 패키지를 설치해야 합니다:")
        for package_name, version in missing_packages:
            version_info = f" (>= {version})" if version else ""
            print(f"  - {package_name}{version_info}")
        
        # 사용자 확인
        response = input("\n패키지를 자동으로 설치하시겠습니까? (y/n): ").strip().lower()
        if response not in ['y', 'yes', '예']:
            print("⚠️ 패키지 설치가 취소되었습니다.")
            return False
        
        print("\n🚀 패키지 설치를 시작합니다...\n")
        
        # 누락된 패키지 설치
        success_count = 0
        for package_name, version in missing_packages:
            if self.install_package(package_name, version):
                success_count += 1
        
        # 결과 출력
        print(f"\n📊 설치 결과:")
        print(f"  ✅ 성공: {success_count}개")
        print(f"  ❌ 실패: {len(self.failed_packages)}개")
        
        if self.installed_packages:
            print(f"\n🎉 설치된 패키지:")
            for pkg in self.installed_packages:
                print(f"  - {pkg}")
        
        if self.failed_packages:
            print(f"\n⚠️ 설치 실패한 패키지:")
            for pkg in self.failed_packages:
                print(f"  - {pkg}")
            print("\n💡 실패한 패키지는 수동으로 설치해주세요:")
            for pkg in self.failed_packages:
                print(f"   pip install {pkg}")
        
        return len(self.failed_packages) == 0
    
    def upgrade_pip(self):
        """pip 업그레이드"""
        try:
            print("🔧 pip을 최신 버전으로 업그레이드하는 중...")
            result = subprocess.run([
                sys.executable, '-m', 'pip', 'install', '--upgrade', 'pip'
            ], capture_output=True, text=True, timeout=120)
            
            if result.returncode == 0:
                print("✅ pip 업그레이드 완료!")
                return True
            else:
                print("⚠️ pip 업그레이드 실패 (계속 진행)")
                return False
                
        except Exception as e:
            print(f"⚠️ pip 업그레이드 중 오류: {str(e)} (계속 진행)")
            return False
    
    def install_special_packages(self):
        """
        특별한 설치 방법이 필요한 패키지들 처리 (Windows 전용)
        """
        import platform
        
        if platform.system() != "Windows":
            return True
        
        special_packages = {
            'pyaudio': self._install_pyaudio_windows
        }
        
        for package_name, install_func in special_packages.items():
            if not self.is_package_installed(package_name):
                print(f"🔧 {package_name} 특별 설치 시도...")
                if not install_func():
                    print(f"⚠️ {package_name} 특별 설치 실패")
        
        return True
    
    def _install_pyaudio_windows(self):
        """Windows에서 PyAudio 설치"""
        try:
            # pipwin 먼저 설치
            subprocess.run([
                sys.executable, '-m', 'pip', 'install', 'pipwin'
            ], capture_output=True, text=True, timeout=120)
            
            # pipwin으로 pyaudio 설치
            result = subprocess.run([
                sys.executable, '-m', 'pipwin', 'install', 'pyaudio'
            ], capture_output=True, text=True, timeout=120)
            
            return result.returncode == 0
            
        except Exception:
            return False

def check_and_install_dependencies(requirements_file="requirements.txt"):
    """
    의존성 확인 및 설치 (main에서 호출할 함수)
    
    Args:
        requirements_file (str): requirements.txt 파일 경로
        
    Returns:
        bool: 모든 패키지 설치 성공 여부
    """
    manager = PackageManager(requirements_file)
    
    # pip 업그레이드
    manager.upgrade_pip()
    
    # 특별 패키지 설치 (Windows PyAudio 등)
    manager.install_special_packages()
    
    # 일반 패키지 확인 및 설치
    return manager.check_and_install_packages()

def verify_critical_imports():
    """
    핵심 모듈들이 정상적으로 import되는지 확인
    
    Returns:
        bool: 모든 핵심 모듈 import 성공 여부
    """
    critical_modules = [
        ('openai', 'OpenAI API'),
        ('elevenlabs', 'ElevenLabs API'),
        ('pyaudio', 'Audio recording'),
        ('numpy', 'Audio processing'),
        ('dotenv', 'Environment variables')
    ]
    
    print("\n🔍 핵심 모듈 import 테스트...")
    
    failed_modules = []
    for module_name, description in critical_modules:
        try:
            __import__(module_name)
            print(f"✅ {module_name} - {description}")
        except ImportError as e:
            print(f"❌ {module_name} - {description}: {str(e)}")
            failed_modules.append(module_name)
    
    if failed_modules:
        print(f"\n⚠️ {len(failed_modules)}개의 핵심 모듈에 문제가 있습니다:")
        for module in failed_modules:
            print(f"  - {module}")
        print("\n프로그램이 정상적으로 작동하지 않을 수 있습니다.")
        return False
    else:
        print("\n🎉 모든 핵심 모듈이 정상적으로 로드되었습니다!")
        return True
