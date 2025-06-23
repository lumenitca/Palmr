#!/usr/bin/env python3
"""
Script to automatically translate strings marked with [TO_TRANSLATE] 
using free Google Translate.
"""

import json
import time
import re
from pathlib import Path
from typing import Dict, Any, List, Tuple, Optional
import argparse
import sys

# Language code mapping from file names to Google Translate codes
LANGUAGE_MAPPING = {
    'pt-BR.json': 'pt',      # Portuguese (Brazil) -> Portuguese
    'es-ES.json': 'es',      # Spanish (Spain) -> Spanish
    'fr-FR.json': 'fr',      # French (France) -> French
    'de-DE.json': 'de',      # German -> German
    'it-IT.json': 'it',      # Italian -> Italian
    'ru-RU.json': 'ru',      # Russian -> Russian
    'ja-JP.json': 'ja',      # Japanese -> Japanese
    'ko-KR.json': 'ko',      # Korean -> Korean
    'zh-CN.json': 'zh-cn',   # Chinese (Simplified) -> Simplified Chinese
    'ar-SA.json': 'ar',      # Arabic -> Arabic
    'hi-IN.json': 'hi',      # Hindi -> Hindi
    'nl-NL.json': 'nl',      # Dutch -> Dutch
    'tr-TR.json': 'tr',      # Turkish -> Turkish
    'pl-PL.json': 'pl',      # Polish -> Polish
}

# Prefix to identify untranslated strings
TO_TRANSLATE_PREFIX = '[TO_TRANSLATE] '


def load_json_file(file_path: Path) -> Dict[str, Any]:
    """Load a JSON file."""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            return json.load(f)
    except Exception as e:
        print(f"❌ Error loading {file_path}: {e}")
        return {}


def save_json_file(file_path: Path, data: Dict[str, Any], indent: int = 2) -> bool:
    """Save a JSON file with consistent formatting."""
    try:
        with open(file_path, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=indent, separators=(',', ': '))
            f.write('\n')  # Add newline at the end
        return True
    except Exception as e:
        print(f"❌ Error saving {file_path}: {e}")
        return False


def get_nested_value(data: Dict[str, Any], key_path: str) -> Any:
    """Get a nested value using a key with dots as separator."""
    keys = key_path.split('.')
    current = data
    
    for key in keys:
        if isinstance(current, dict) and key in current:
            current = current[key]
        else:
            return None
    
    return current


def set_nested_value(data: Dict[str, Any], key_path: str, value: Any) -> None:
    """Set a nested value using a key with dots as separator."""
    keys = key_path.split('.')
    current = data
    
    # Navigate to the second-to-last level, creating dictionaries as needed
    for key in keys[:-1]:
        if key not in current:
            current[key] = {}
        elif not isinstance(current[key], dict):
            current[key] = {}
        current = current[key]
    
    # Set the value at the last level
    current[keys[-1]] = value


def find_untranslated_strings(data: Dict[str, Any], prefix: str = '') -> List[Tuple[str, str]]:
    """Find all strings marked with [TO_TRANSLATE] recursively."""
    untranslated = []
    
    for key, value in data.items():
        current_key = f"{prefix}.{key}" if prefix else key
        
        if isinstance(value, str) and value.startswith(TO_TRANSLATE_PREFIX):
            # Remove prefix to get original text
            original_text = value[len(TO_TRANSLATE_PREFIX):].strip()
            untranslated.append((current_key, original_text))
        elif isinstance(value, dict):
            untranslated.extend(find_untranslated_strings(value, current_key))
    
    return untranslated


def install_googletrans():
    """Install the googletrans library if not available."""
    try:
        import googletrans
        return True
    except ImportError:
        print("📦 'googletrans' library not found. Attempting to install...")
        import subprocess
        try:
            subprocess.check_call([sys.executable, "-m", "pip", "install", "googletrans==4.0.0rc1"])
            print("✅ googletrans installed successfully!")
            return True
        except subprocess.CalledProcessError:
            print("❌ Failed to install googletrans. Install manually with:")
            print("pip install googletrans==4.0.0rc1")
            return False


def translate_text(text: str, target_language: str, max_retries: int = 3) -> Optional[str]:
    """Translate text using free Google Translate."""
    try:
        from googletrans import Translator
        
        translator = Translator()
        
        for attempt in range(max_retries):
            try:
                # Translate from English to target language
                result = translator.translate(text, src='en', dest=target_language)
                
                if result and result.text:
                    return result.text.strip()
                    
            except Exception as e:
                if attempt < max_retries - 1:
                    print(f"  ⚠️  Attempt {attempt + 1} failed: {str(e)[:50]}... Retrying in 2s...")
                    time.sleep(2)
                else:
                    print(f"  ❌ Failed after {max_retries} attempts: {str(e)[:50]}...")
                    
        return None
        
    except ImportError:
        print("❌ googletrans library not available")
        return None


def translate_file(file_path: Path, target_language: str, dry_run: bool = False, 
                  delay_between_requests: float = 1.0) -> Tuple[int, int, int]:
    """
    Translate all [TO_TRANSLATE] strings in a file.
    Returns: (total_found, successful_translations, failed_translations)
    """
    print(f"🔍 Processing: {file_path.name}")
    
    # Load file
    data = load_json_file(file_path)
    if not data:
        return 0, 0, 0
    
    # Find untranslated strings
    untranslated_strings = find_untranslated_strings(data)
    
    if not untranslated_strings:
        print(f"  ✅ No strings to translate")
        return 0, 0, 0
    
    print(f"  📝 Found {len(untranslated_strings)} strings to translate")
    
    if dry_run:
        print(f"  🔍 [DRY RUN] Strings that would be translated:")
        for key, text in untranslated_strings[:3]:
            print(f"    - {key}: \"{text[:50]}{'...' if len(text) > 50 else ''}\"")
        if len(untranslated_strings) > 3:
            print(f"    ... and {len(untranslated_strings) - 3} more")
        return len(untranslated_strings), 0, 0
    
    # Translate each string
    successful = 0
    failed = 0
    updated_data = data.copy()
    
    for i, (key_path, original_text) in enumerate(untranslated_strings, 1):
        print(f"  📍 ({i}/{len(untranslated_strings)}) Translating: {key_path}")
        
        # Translate text
        translated_text = translate_text(original_text, target_language)
        
        if translated_text and translated_text != original_text:
            # Update in dictionary
            set_nested_value(updated_data, key_path, translated_text)
            successful += 1
            print(f"    ✅ \"{original_text[:30]}...\" → \"{translated_text[:30]}...\"")
        else:
            failed += 1
            print(f"    ❌ Translation failed")
        
        # Delay between requests to avoid rate limiting
        if i < len(untranslated_strings):  # Don't wait after the last one
            time.sleep(delay_between_requests)
    
    # Save updated file
    if successful > 0:
        if save_json_file(file_path, updated_data):
            print(f"  💾 File saved with {successful} translations")
        else:
            print(f"  ❌ Error saving file")
            failed += successful  # Count as failure if couldn't save
            successful = 0
    
    return len(untranslated_strings), successful, failed


def translate_all_files(messages_dir: Path, delay_between_requests: float = 1.0, 
                       dry_run: bool = False, skip_languages: List[str] = None) -> None:
    """Translate all language files that have [TO_TRANSLATE] strings."""
    
    if not install_googletrans():
        return
    
    skip_languages = skip_languages or []
    
    # Find language JSON files
    language_files = []
    for file_name, lang_code in LANGUAGE_MAPPING.items():
        file_path = messages_dir / file_name
        if file_path.exists() and file_name not in skip_languages:
            language_files.append((file_path, lang_code))
    
    if not language_files:
        print("❌ No language files found")
        return
    
    print(f"🌍 Translating {len(language_files)} languages...")
    print(f"⏱️  Delay between requests: {delay_between_requests}s")
    if dry_run:
        print("🔍 DRY RUN MODE - No changes will be made")
    print("-" * 60)
    
    total_found = 0
    total_successful = 0
    total_failed = 0
    
    for i, (file_path, lang_code) in enumerate(language_files, 1):
        print(f"\n[{i}/{len(language_files)}] 🌐 Language: {lang_code.upper()}")
        
        found, successful, failed = translate_file(
            file_path, lang_code, dry_run, delay_between_requests
        )
        
        total_found += found
        total_successful += successful
        total_failed += failed
        
        # Pause between files (except the last one)
        if i < len(language_files) and not dry_run:
            print(f"  ⏸️  Pausing {delay_between_requests * 2}s before next language...")
            time.sleep(delay_between_requests * 2)
    
    # Final summary
    print("\n" + "=" * 60)
    print("📊 FINAL SUMMARY")
    print("=" * 60)
    
    if dry_run:
        print(f"🔍 DRY RUN MODE:")
        print(f"   • {total_found} strings would be translated")
    else:
        print(f"✅ Translations performed:")
        print(f"   • {total_successful} successes")
        print(f"   • {total_failed} failures")
        print(f"   • {total_found} total processed")
        
        if total_successful > 0:
            success_rate = (total_successful / total_found) * 100
            print(f"   • Success rate: {success_rate:.1f}%")
    
    print("\n💡 TIPS:")
    print("• Run 'python3 check_translations.py' to verify results")
    print("• Strings that failed translation keep the [TO_TRANSLATE] prefix")
    print("• Consider reviewing automatic translations to ensure quality")


def main():
    parser = argparse.ArgumentParser(
        description='Automatically translate strings marked with [TO_TRANSLATE]'
    )
    parser.add_argument(
        '--messages-dir', 
        type=Path,
        default=Path(__file__).parent.parent / 'messages',
        help='Directory containing message files (default: ../messages)'
    )
    parser.add_argument(
        '--dry-run', 
        action='store_true',
        help='Only show what would be translated without making changes'
    )
    parser.add_argument(
        '--delay', 
        type=float,
        default=1.0,
        help='Delay in seconds between translation requests (default: 1.0)'
    )
    parser.add_argument(
        '--skip-languages',
        nargs='*',
        default=[],
        help='List of languages to skip (ex: pt-BR.json fr-FR.json)'
    )
    
    args = parser.parse_args()
    
    if not args.messages_dir.exists():
        print(f"❌ Directory not found: {args.messages_dir}")
        return 1
    
    print(f"📁 Directory: {args.messages_dir}")
    print(f"🔍 Dry run: {args.dry_run}")
    print(f"⏱️  Delay: {args.delay}s")
    if args.skip_languages:
        print(f"⏭️  Skipping: {', '.join(args.skip_languages)}")
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