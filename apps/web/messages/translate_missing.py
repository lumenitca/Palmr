#!/usr/bin/env python3
"""
Script para traduzir automaticamente strings marcadas com [TO_TRANSLATE] 
usando Google Translate gratuito.
"""

import json
import time
import re
from pathlib import Path
from typing import Dict, Any, List, Tuple, Optional
import argparse
import sys

# Mapeamento de códigos de idioma dos arquivos para códigos do Google Translate
LANGUAGE_MAPPING = {
    'pt-BR.json': 'pt',      # Português (Brasil) -> Português
    'es-ES.json': 'es',      # Espanhol (Espanha) -> Espanhol
    'fr-FR.json': 'fr',      # Francês (França) -> Francês
    'de-DE.json': 'de',      # Alemão -> Alemão
    'it-IT.json': 'it',      # Italiano -> Italiano
    'ru-RU.json': 'ru',      # Russo -> Russo
    'ja-JP.json': 'ja',      # Japonês -> Japonês
    'ko-KR.json': 'ko',      # Coreano -> Coreano
    'zh-CN.json': 'zh-cn',   # Chinês (Simplificado) -> Chinês Simplificado
    'ar-SA.json': 'ar',      # Árabe -> Árabe
    'hi-IN.json': 'hi',      # Hindi -> Hindi
    'nl-NL.json': 'nl',      # Holandês -> Holandês
    'tr-TR.json': 'tr',      # Turco -> Turco
    'pl-PL.json': 'pl',      # Polonês -> Polonês
}

# Prefixo para identificar strings não traduzidas
TO_TRANSLATE_PREFIX = '[TO_TRANSLATE] '


def load_json_file(file_path: Path) -> Dict[str, Any]:
    """Carrega um arquivo JSON."""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            return json.load(f)
    except Exception as e:
        print(f"❌ Erro ao carregar {file_path}: {e}")
        return {}


def save_json_file(file_path: Path, data: Dict[str, Any], indent: int = 2) -> bool:
    """Salva um arquivo JSON com formatação consistente."""
    try:
        with open(file_path, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=indent, separators=(',', ': '))
            f.write('\n')  # Adiciona nova linha no final
        return True
    except Exception as e:
        print(f"❌ Erro ao salvar {file_path}: {e}")
        return False


def get_nested_value(data: Dict[str, Any], key_path: str) -> Any:
    """Obtém um valor aninhado usando uma chave com pontos como separador."""
    keys = key_path.split('.')
    current = data
    
    for key in keys:
        if isinstance(current, dict) and key in current:
            current = current[key]
        else:
            return None
    
    return current


def set_nested_value(data: Dict[str, Any], key_path: str, value: Any) -> None:
    """Define um valor aninhado usando uma chave com pontos como separador."""
    keys = key_path.split('.')
    current = data
    
    # Navega até o penúltimo nível, criando dicionários conforme necessário
    for key in keys[:-1]:
        if key not in current:
            current[key] = {}
        elif not isinstance(current[key], dict):
            current[key] = {}
        current = current[key]
    
    # Define o valor no último nível
    current[keys[-1]] = value


def find_untranslated_strings(data: Dict[str, Any], prefix: str = '') -> List[Tuple[str, str]]:
    """Encontra todas as strings marcadas com [TO_TRANSLATE] recursivamente."""
    untranslated = []
    
    for key, value in data.items():
        current_key = f"{prefix}.{key}" if prefix else key
        
        if isinstance(value, str) and value.startswith(TO_TRANSLATE_PREFIX):
            # Remove o prefixo para obter o texto original
            original_text = value[len(TO_TRANSLATE_PREFIX):].strip()
            untranslated.append((current_key, original_text))
        elif isinstance(value, dict):
            untranslated.extend(find_untranslated_strings(value, current_key))
    
    return untranslated


def install_googletrans():
    """Instala a biblioteca googletrans se não estiver disponível."""
    try:
        import googletrans
        return True
    except ImportError:
        print("📦 Biblioteca 'googletrans' não encontrada. Tentando instalar...")
        import subprocess
        try:
            subprocess.check_call([sys.executable, "-m", "pip", "install", "googletrans==4.0.0rc1"])
            print("✅ googletrans instalada com sucesso!")
            return True
        except subprocess.CalledProcessError:
            print("❌ Falha ao instalar googletrans. Instale manualmente com:")
            print("pip install googletrans==4.0.0rc1")
            return False


def translate_text(text: str, target_language: str, max_retries: int = 3) -> Optional[str]:
    """Traduz um texto usando Google Translate gratuito."""
    try:
        from googletrans import Translator
        
        translator = Translator()
        
        for attempt in range(max_retries):
            try:
                # Traduz do inglês para o idioma alvo
                result = translator.translate(text, src='en', dest=target_language)
                
                if result and result.text:
                    return result.text.strip()
                    
            except Exception as e:
                if attempt < max_retries - 1:
                    print(f"  ⚠️  Tentativa {attempt + 1} falhou: {str(e)[:50]}... Reentando em 2s...")
                    time.sleep(2)
                else:
                    print(f"  ❌ Falha após {max_retries} tentativas: {str(e)[:50]}...")
                    
        return None
        
    except ImportError:
        print("❌ Biblioteca googletrans não disponível")
        return None


def translate_file(file_path: Path, target_language: str, dry_run: bool = False, 
                  delay_between_requests: float = 1.0) -> Tuple[int, int, int]:
    """
    Traduz todas as strings [TO_TRANSLATE] em um arquivo.
    Retorna: (total_found, successful_translations, failed_translations)
    """
    print(f"🔍 Processando: {file_path.name}")
    
    # Carrega o arquivo
    data = load_json_file(file_path)
    if not data:
        return 0, 0, 0
    
    # Encontra strings não traduzidas
    untranslated_strings = find_untranslated_strings(data)
    
    if not untranslated_strings:
        print(f"  ✅ Nenhuma string para traduzir")
        return 0, 0, 0
    
    print(f"  📝 Encontradas {len(untranslated_strings)} strings para traduzir")
    
    if dry_run:
        print(f"  🔍 [DRY RUN] Strings que seriam traduzidas:")
        for key, text in untranslated_strings[:3]:
            print(f"    - {key}: \"{text[:50]}{'...' if len(text) > 50 else ''}\"")
        if len(untranslated_strings) > 3:
            print(f"    ... e mais {len(untranslated_strings) - 3}")
        return len(untranslated_strings), 0, 0
    
    # Traduz cada string
    successful = 0
    failed = 0
    updated_data = data.copy()
    
    for i, (key_path, original_text) in enumerate(untranslated_strings, 1):
        print(f"  📍 ({i}/{len(untranslated_strings)}) Traduzindo: {key_path}")
        
        # Traduz o texto
        translated_text = translate_text(original_text, target_language)
        
        if translated_text and translated_text != original_text:
            # Atualiza no dicionário
            set_nested_value(updated_data, key_path, translated_text)
            successful += 1
            print(f"    ✅ \"{original_text[:30]}...\" → \"{translated_text[:30]}...\"")
        else:
            failed += 1
            print(f"    ❌ Falha na tradução")
        
        # Delay entre requisições para evitar rate limiting
        if i < len(untranslated_strings):  # Não espera após a última
            time.sleep(delay_between_requests)
    
    # Salva o arquivo atualizado
    if successful > 0:
        if save_json_file(file_path, updated_data):
            print(f"  💾 Arquivo salvo com {successful} traduções")
        else:
            print(f"  ❌ Erro ao salvar arquivo")
            failed += successful  # Conta como falha se não conseguiu salvar
            successful = 0
    
    return len(untranslated_strings), successful, failed


def translate_all_files(messages_dir: Path, delay_between_requests: float = 1.0, 
                       dry_run: bool = False, skip_languages: List[str] = None) -> None:
    """Traduz todos os arquivos de idioma que têm strings [TO_TRANSLATE]."""
    
    if not install_googletrans():
        return
    
    skip_languages = skip_languages or []
    
    # Encontra arquivos JSON de idioma
    language_files = []
    for file_name, lang_code in LANGUAGE_MAPPING.items():
        file_path = messages_dir / file_name
        if file_path.exists() and file_name not in skip_languages:
            language_files.append((file_path, lang_code))
    
    if not language_files:
        print("❌ Nenhum arquivo de idioma encontrado")
        return
    
    print(f"🌍 Traduzindo {len(language_files)} idiomas...")
    print(f"⏱️  Delay entre requisições: {delay_between_requests}s")
    if dry_run:
        print("🔍 MODO DRY RUN - Nenhuma alteração será feita")
    print("-" * 60)
    
    total_found = 0
    total_successful = 0
    total_failed = 0
    
    for i, (file_path, lang_code) in enumerate(language_files, 1):
        print(f"\n[{i}/{len(language_files)}] 🌐 Idioma: {lang_code.upper()}")
        
        found, successful, failed = translate_file(
            file_path, lang_code, dry_run, delay_between_requests
        )
        
        total_found += found
        total_successful += successful
        total_failed += failed
        
        # Pausa entre arquivos (exceto o último)
        if i < len(language_files) and not dry_run:
            print(f"  ⏸️  Pausando {delay_between_requests * 2}s antes do próximo idioma...")
            time.sleep(delay_between_requests * 2)
    
    # Sumário final
    print("\n" + "=" * 60)
    print("📊 SUMÁRIO FINAL")
    print("=" * 60)
    
    if dry_run:
        print(f"🔍 MODO DRY RUN:")
        print(f"   • {total_found} strings seriam traduzidas")
    else:
        print(f"✅ Traduções realizadas:")
        print(f"   • {total_successful} sucessos")
        print(f"   • {total_failed} falhas")
        print(f"   • {total_found} total processadas")
        
        if total_successful > 0:
            success_rate = (total_successful / total_found) * 100
            print(f"   • Taxa de sucesso: {success_rate:.1f}%")
    
    print("\n💡 DICAS:")
    print("• Execute 'python3 check_translations.py' para verificar o resultado")
    print("• Strings que falharam na tradução mantêm o prefixo [TO_TRANSLATE]")
    print("• Considere revisar as traduções automáticas para garantir qualidade")


def main():
    parser = argparse.ArgumentParser(
        description='Traduz automaticamente strings marcadas com [TO_TRANSLATE]'
    )
    parser.add_argument(
        '--messages-dir', 
        type=Path,
        default=Path(__file__).parent,
        help='Diretório contendo os arquivos de mensagem (padrão: diretório atual)'
    )
    parser.add_argument(
        '--dry-run', 
        action='store_true',
        help='Apenas mostra o que seria traduzido, sem fazer alterações'
    )
    parser.add_argument(
        '--delay', 
        type=float,
        default=1.0,
        help='Delay em segundos entre requisições de tradução (padrão: 1.0)'
    )
    parser.add_argument(
        '--skip-languages',
        nargs='*',
        default=[],
        help='Lista de idiomas para pular (ex: pt-BR.json fr-FR.json)'
    )
    
    args = parser.parse_args()
    
    if not args.messages_dir.exists():
        print(f"❌ Diretório não encontrado: {args.messages_dir}")
        return 1
    
    print(f"📁 Diretório: {args.messages_dir}")
    print(f"🔍 Dry run: {args.dry_run}")
    print(f"⏱️  Delay: {args.delay}s")
    if args.skip_languages:
        print(f"⏭️  Ignorando: {', '.join(args.skip_languages)}")
    print("-" * 60)
    
    translate_all_files(
        messages_dir=args.messages_dir,
        delay_between_requests=args.delay,
        dry_run=args.dry_run,
        skip_languages=args.skip_languages
    )
    
    return 0


if __name__ == '__main__':
    exit(main()) 