import argparse
import time
from datetime import datetime
from tools import model_trainer


def run_retrain():
    """Trigger a retrain using the existing model_trainer pipeline."""
    print(f"[auto-train] Starting retrain at {datetime.now().isoformat(timespec='seconds')}")
    try:
        result = model_trainer.retrain_model()
        print(f"[auto-train] Status: {result.get('status')} | Delta: {result.get('delta')} | Samples: {result.get('samples_trained')}")
        return result
    except Exception as exc:
        print(f"[auto-train] Error: {exc}")
        return None


def main():
    parser = argparse.ArgumentParser(description="Auto-train spam classifier and update the deployed model.")
    parser.add_argument(
        "--interval",
        type=int,
        default=0,
        help="Seconds between retrain runs. Set to 0 to run once and exit."
    )
    args = parser.parse_args()

    if args.interval <= 0:
        run_retrain()
        return

    print(f"[auto-train] Running in loop every {args.interval} seconds. Press Ctrl+C to stop.")
    while True:
        run_retrain()
        time.sleep(args.interval)


if __name__ == "__main__":
    main()
