"use client";

import { motion } from "framer-motion";

export type ComingSoonKind = "wallet" | "subscription";

const SOON_COPY: Record<ComingSoonKind, { service: string; line: string }> = {
  wallet: {
    service: "کیف پول و باشگاه سبز",
    line: "امتیاز و اعتبار را همین‌جا نگه می‌داریم تا مسیر درست برسد.",
  },
  subscription: {
    service: "اشتراک هفتگی سبد",
    line: "وقتی زنجیرهٔ سرد از مرتع آماده شد، از همین میز باز می‌شود.",
  },
};

export function ProfileComingSoon({
  kind,
  onClose,
}: {
  kind: ComingSoonKind;
  onClose: () => void;
}) {
  const copy = SOON_COPY[kind];

  return (
    <motion.div
      className="mk-soon-layer"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35 }}
    >
      <button type="button" className="mk-soon-veil" aria-label="بستن" onClick={onClose} />
      <span className="mk-soon-mist is-a" aria-hidden="true" />
      <span className="mk-soon-mist is-b" aria-hidden="true" />

      <div className="mk-soon-stage" role="dialog" aria-modal="true" aria-labelledby="mk-soon-word">
        <div className="mk-soon-pair">
          <motion.div
            className="mk-soon-voice"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
          >
            <p className="mk-soon-service">{copy.service}</p>
            <h2 id="mk-soon-word">به‌زودی.</h2>
            <span className="mk-soon-rule" aria-hidden="true" />
            <p className="mk-soon-line">{copy.line}</p>
            <p className="mk-soon-motto">این راه سبز است</p>
            <button type="button" className="mk-soon-back" onClick={onClose}>
              بازگشت به میز
            </button>
          </motion.div>

          <motion.div
            className="mk-soon-figure"
            initial={{ opacity: 0, y: 48 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
          >
            <span className="mk-soon-ground" aria-hidden="true" />
            {/* native img: Next/Image box was wider than the painted figure */}
            <img
              src="/brand/profile/soon-mountain-man-stand.png"
              alt="مرد کوهستان"
              width={429}
              height={1112}
              className="mk-soon-man"
            />
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
