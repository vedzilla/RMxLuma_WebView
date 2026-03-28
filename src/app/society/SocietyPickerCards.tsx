"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";

interface SocietyAccount {
  id: string;
  society_account_approval_status: { name: string };
  societies: {
    id: string;
    name: string;
    image_url: string | null;
    universities: { name: string } | null;
  } | null;
}

export function SocietyPickerCards({
  approvedAccounts,
  pendingAccounts,
}: {
  approvedAccounts: SocietyAccount[];
  pendingAccounts: SocietyAccount[];
}) {
  return (
    <div className="space-y-8">
      {approvedAccounts.length > 0 && (
        <section>
          <motion.h2
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="text-sm font-medium text-[var(--muted)] uppercase tracking-wide mb-3"
          >
            Approved
          </motion.h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {approvedAccounts.map((account, index) => {
              const society = account.societies;
              if (!society) return null;

              return (
                <motion.div
                  key={account.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: index * 0.06, ease: "easeOut" }}
                >
                  <Link
                    href={`/society/${society.id}/dashboard`}
                    className="flex items-center gap-4 p-4 bg-[var(--surface)] rounded-[var(--radius)] border border-[var(--border)] transition-all duration-[120ms] hover:-translate-y-1 hover:shadow-lg hover:border-[#DC2626] hover:ring-2 hover:ring-[#DC2626]/20"
                  >
                    <Image
                      src={society.image_url || "/logos/rm-dot-logo.png"}
                      alt={society.name}
                      width={48}
                      height={48}
                      className="rounded-full object-cover"
                    />
                    <div>
                      <p className="font-medium text-[var(--text)]">{society.name}</p>
                      <p className="text-sm text-[var(--muted)]">
                        {society.universities?.name ?? "Unknown university"}
                      </p>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </section>
      )}
      {pendingAccounts.length > 0 && (
        <section>
          <motion.h2
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: approvedAccounts.length * 0.06 }}
            className="text-sm font-medium text-[var(--muted)] uppercase tracking-wide mb-3"
          >
            Pending Approval
          </motion.h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {pendingAccounts.map((account, index) => {
              const society = account.societies;
              if (!society) return null;
              const status = account.society_account_approval_status.name;

              return (
                <motion.div
                  key={account.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.35,
                    delay: (approvedAccounts.length + index) * 0.06,
                    ease: "easeOut",
                  }}
                >
                  <Link
                    href="#"
                    aria-disabled
                    className="flex items-center gap-4 p-4 bg-[var(--surface)] rounded-[var(--radius)] border border-[var(--border)] transition-all opacity-60 cursor-not-allowed"
                  >
                    <Image
                      src={society.image_url || "/logos/rm-dot-logo.png"}
                      alt={society.name}
                      width={48}
                      height={48}
                      className="rounded-full object-cover"
                    />
                    <div>
                      <p className="font-medium text-[var(--text)]">{society.name}</p>
                      <p className="text-sm text-[var(--muted)]">
                        {society.universities?.name ?? "Unknown university"}
                      </p>
                      <p className="text-xs text-[var(--muted)] mt-0.5 capitalize">
                        {status}
                      </p>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
