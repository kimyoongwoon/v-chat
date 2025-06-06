import openai
import os
from dotenv import load_dotenv

load_dotenv()

class VChatBot:
    def __init__(self, persona_manager=None):
        self.client = openai.OpenAI(api_key=os.getenv('OPENAI_API_KEY'))
        self.persona_manager = persona_manager
        self.model_id = self.get_model_id()
        
    def get_model_id(self):
        """PersonaManager에서 모델 ID 가져오기"""
        if self.persona_manager and self.persona_manager.get_model_id():
            return self.persona_manager.get_model_id()
        
        # 기본값으로 파일에서 로드 시도
        model_files = [
            'data/fine_tuned_model_id_v2.txt',
            'data/fine_tuned_model_id.txt'
        ]
        
        for model_file in model_files:
            try:
                with open(model_file, 'r') as f:
                    model_id = f.read().strip()
                    return model_id
            except FileNotFoundError:
                continue
        
        return "gpt-4o-mini-2024-07-18"
    
    def update_persona(self, persona_manager):
        """페르소나 업데이트"""
        self.persona_manager = persona_manager
        self.model_id = self.get_model_id()
    
    def build_few_shot_messages(self, user_input: str):
        """Few-shot learning을 위한 메시지 구성"""
        if not self.persona_manager:
            return [{"role": "user", "content": user_input}]
        
        system_prompt = self.persona_manager.generate_system_prompt()
        few_shot_examples = self.persona_manager.get_few_shot_examples()
        
        system_prompt += """

다음은 당신의 말투를 보여주는 완벽한 예시들입니다. 이 예시들의 말투와 톤을 정확히 따라해주세요:

특히 주목할 점:
- 자연스럽고 즉흥적인 반응
- 친근하고 편안한 말투
- 감정이 풍부하게 드러나는 표현
- 상황에 맞는 적절한 리액션
- 반말 사용과 애교 있는 톤

위 예시들처럼 자연스럽고 일관된 말투로 대답해주세요."""

        messages = [{"role": "system", "content": system_prompt}]
        
        # Few-shot 예제들 추가
        for example in few_shot_examples:
            messages.append({"role": "user", "content": example["user"]})
            messages.append({"role": "assistant", "content": example["assistant"]})
        
        # 실제 사용자 입력
        messages.append({"role": "user", "content": user_input})
        
        return messages
    
    def get_response(self, user_input: str) -> str:
        """Few-shot learning을 활용한 응답 생성"""
        try:
            messages = self.build_few_shot_messages(user_input)
            
            response = self.client.chat.completions.create(
                model=self.model_id,
                messages=messages,
                temperature=0.8,
                max_tokens=250
            )
            
            return response.choices[0].message.content.strip()
            
        except Exception:
            return "아 미안, 지금 잠깐 말이 안 나오네 ㅋㅋ 다시 말해줘!"
