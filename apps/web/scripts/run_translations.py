#!/usr/bin/env python3
"""
Main script to run all Palmr translation operations.
Makes it easy to run scripts without remembering specific names.
"""

import sys
import subprocess
from pathlib import Path
import argparse


def run_command(script_name: str, args: list) -> int:
    """Execute a script with the provided arguments."""
    script_path = Path(__file__).parent / script_name
    cmd = [sys.executable, str(script_path)] + args
    return subprocess.run(cmd).returncode


def main():
    parser = argparse.ArgumentParser(
        description='Main script to manage Palmr translations',
        epilog='Examples:\n'
               '  python3 run_translations.py check\n'
               '  python3 run_translations.py sync --dry-run\n'
               '  python3 run_translations.py translate --delay 2.0\n'
               '  python3 run_translations.py all  # Complete workflow\n',
        formatter_class=argparse.RawDescriptionHelpFormatter
    )
    
    parser.add_argument(
        'command',
        choices=['check', 'sync', 'translate', 'all', 'help'],
        help='Command to execute:\n'
             'check - Check translation status\n'
             'sync - Synchronize missing keys\n' 
             'translate - Automatically translate strings\n'
             'all - Run complete workflow\n'
             'help - Show detailed help'
    )
    
    # Capture remaining arguments to pass to scripts
    args, remaining_args = parser.parse_known_args()
    
    if args.command == 'help':
        print("🌍 PALMR TRANSLATION MANAGER")
        print("=" * 50)
        print()
        print("📋 AVAILABLE COMMANDS:")
        print()
        print("🔍 check - Check translation status")
        print("   python3 run_translations.py check")
        print("   python3 run_translations.py check --reference pt-BR.json")
        print()
        print("🔄 sync - Synchronize missing keys")
        print("   python3 run_translations.py sync")
        print("   python3 run_translations.py sync --dry-run")
        print("   python3 run_translations.py sync --no-mark-untranslated")
        print()
        print("🌐 translate - Automatically translate")
        print("   python3 run_translations.py translate")
        print("   python3 run_translations.py translate --dry-run")
        print("   python3 run_translations.py translate --delay 2.0")
        print("   python3 run_translations.py translate --skip-languages pt-BR.json")
        print()
        print("⚡ all - Complete workflow (sync + translate)")
        print("   python3 run_translations.py all")
        print("   python3 run_translations.py all --dry-run")
        print()
        print("📁 STRUCTURE:")
        print("   apps/web/scripts/    - Management scripts")
        print("   apps/web/messages/   - Translation files")
        print()
        print("💡 TIPS:")
        print("• Use --dry-run on any command to test")
        print("• Use --help on any command for specific options")
        print("• Read https://docs.palmr.dev/docs/3.0-beta/translation-management for complete documentation")
        return 0
    
    elif args.command == 'check':
        print("🔍 Checking translation status...")
        return run_command('check_translations.py', remaining_args)
    
    elif args.command == 'sync':
        print("🔄 Synchronizing translation keys...")
        return run_command('sync_translations.py', remaining_args)
    
    elif args.command == 'translate':
        print("🌐 Automatically translating strings...")
        return run_command('translate_missing.py', remaining_args)
    
    elif args.command == 'all':
        print("⚡ Running complete translation workflow...")
        print()
        
        # Determine if it's dry-run based on arguments
        is_dry_run = '--dry-run' in remaining_args
        
        # 1. Initial check
        print("1️⃣ Checking initial status...")
        result = run_command('check_translations.py', remaining_args)
        if result != 0:
            print("❌ Error in initial check")
            return result
        
        print("\n" + "="*50)
        
        # 2. Sync
        print("2️⃣ Synchronizing missing keys...")
        result = run_command('sync_translations.py', remaining_args)
        if result != 0:
            print("❌ Error in synchronization")
            return result
        
        if not is_dry_run:
            print("\n" + "="*50)
            
            # 3. Translate
            print("3️⃣ Automatically translating strings...")
            result = run_command('translate_missing.py', remaining_args)
            if result != 0:
                print("❌ Error in translation")
                return result
            
            print("\n" + "="*50)
            
            # 4. Final check
            print("4️⃣ Final check...")
            result = run_command('check_translations.py', remaining_args)
            if result != 0:
                print("❌ Error in final check")
                return result
        
        print("\n🎉 Complete workflow executed successfully!")
        if is_dry_run:
            print("💡 Run without --dry-run to apply changes")
        
        return 0
    
    return 0


if __name__ == '__main__':
    exit(main()) 