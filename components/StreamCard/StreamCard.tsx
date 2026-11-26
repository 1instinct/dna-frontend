import React from "react";
import moment from "moment";
import Link from "next/link";

export const StreamCard = ({ isPast, item }: any) => {
  return (
    <Link
      href={`/tv/${item.playback_ids[0]}`}
      className="group mx-2.5 flex cursor-pointer flex-col items-center rounded-lg no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
    >
      <div className="relative flex w-full items-center justify-center overflow-hidden rounded-full after:absolute after:inset-0 after:bg-gradient-to-b after:from-transparent after:via-transparent after:to-black/60">
        {!isPast && <div className="absolute inset-0" />}
        <div className="absolute inset-0 z-[1] flex items-center justify-center">
          <p className="mx-auto mb-0 mt-16 p-10 text-center font-title text-sm text-white [text-shadow:0px_0px_10px_rgba(0,0,0,0.66)]">
            {isPast
              ? "Stream Ended Watch Replay"
              : `Streaming ${moment(item.start_date).fromNow()}`}
          </p>
        </div>
        <img src="/3.png" alt="" className="h-full w-full object-cover" />
      </div>

      <h3 className="mt-10 text-center font-title text-base text-foreground">
        {item.title}
      </h3>
    </Link>
  );
};
