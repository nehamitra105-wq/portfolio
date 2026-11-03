const REFERRALS = [
  {
    quote:
      "Neha brought a highly analytical mindset to a broad and complex project. She demonstrated a strong ability to uncover meaningful insights, translate them into actionable recommendations, and proactively develop new solutions. Throughout the internship, she managed her time effectively, continuously applied feedback, and showed deep curiosity and understanding of the problem space.",
    name: "Natalia Sarnacka",
    role: "/ Manager, Experience Design \n@ Adobe",
  },
  {
    quote:
      "Neha delivered excellent design work for our Adobe Experience Design team during her internship. She demonstrated a strong work ethic, proactivity, curiosity, and the ability to take and iterate based on feedback. She worked collaboratively with her team and was effective at managing against deadlines and shifts in priorities.",
    name: "Kirsten Holzer-Liang",
    role: "/ Director, On-Demand Solutions Consulting @ Adobe",
  },
  {
    quote:
      "Neha is independent, analytical, and well-organized. She demonstrates strong process thinking and is confident in taking on new challenges. Neha reacted very well to feedback, works well in ambiguity and open to shifts when needed. Connects creativity with analytic, organized approach.",
    name: "Małgorzata Hawełko",
    role: "/ Director, Experience Design & Automation @ Adobe",
  },
  {
    quote:
      "Neha asks very thoughtful questions and has a very effective communication style as an intern. I've also thought she's brought a lot of good energy and creative solutions to the table when she hit roadblocks. Neha demonstrated a skillset that is often only seen from practitioners further along in their career.",
    name: "Joseph Sisti",
    role: "/ GTM Strategy @ Adobe",
  },
  {
    quote:
      "I had the pleasure of being Neha's mentor during her 3-month summer internship at Adobe, and I highly recommend working with her. She has very promising design and animation skills, is highly open to feedback and applies it effectively, has great presentation skills, and is eager to experiment with new tools and features. Besides that, she’s just a cool person with amazing interests outside of work.",
    name: "Jola Bańkowska",
    role: "/ Communication Designer @ Adobe",
  },
  {
    quote:
      "Neha has been a wonderful asset to the Reforma team this summer. She has done a better job of understanding the product, the customer, and the overall brand persona than any of the masters students / industry professionals I have worked with so far! She takes feedback well, thoroughly considers user behavior and all edge cases, comes with great questions and is a self-starter!",
    name: "Courtney Clapper",
    role: "/ Founder & CEO @ Reforma",
  },
];

const CARD_WIDTH = 307;
const CARD_GAP = 60;
const LOOP_WIDTH = REFERRALS.length * (CARD_WIDTH + CARD_GAP);
// Slow crawl: one full set of cards every 70 seconds.
const LOOP_SECONDS = 70;

function Card({ quote, name, role }: (typeof REFERRALS)[number]) {
  return (
    <div className="relative flex h-[368px] w-[307px] shrink-0 flex-col items-start justify-between border border-solid border-black bg-white p-[20px]">
      <p className="nm w-[267px] text-[16px] leading-[1.32] tracking-[-0.32px] text-black">{quote}</p>
      <div className="flex w-[267px] flex-col items-start leading-[1.32] text-black">
        <p className="nm-medium h-[26px] w-full text-[20px] tracking-[-0.4px]">{name}</p>
        <p className="nm h-[48px] w-full text-[18px] tracking-[-0.36px] whitespace-pre-wrap">{role}</p>
      </div>
      <div className="absolute top-[253px] left-[-1px] h-0 w-[307px]">
        <div className="absolute inset-[-1px_0_0_0]">
          <img alt="" className="block size-full max-w-none" src="/assets/home/ref-line.svg" />
        </div>
      </div>
    </div>
  );
}

// "referals": the cards crawl left forever, fading out under white
// gradients where they cross the container's edges.
export default function Referrals({ style }: { style: React.CSSProperties }) {
  return (
    <section className="absolute flex w-[1306px] flex-col items-start gap-[40px]" style={style}>
      <div className="nm flex items-end gap-[20px] text-black">
        <p className="text-[32px] leading-[1.32] tracking-[-0.64px] whitespace-nowrap">Don’t take my word for it!</p>
        <p className="flex h-[31px] items-center text-[16px] leading-[1.32] tracking-[-0.32px] whitespace-nowrap">( See what others have to say )</p>
      </div>
      <div className="relative h-[368px] w-full overflow-clip">
        <div
          className="absolute top-0 left-0 flex items-center gap-[60px]"
          style={{ animation: `referrals-crawl ${LOOP_SECONDS}s linear infinite` }}
        >
          {[...REFERRALS, ...REFERRALS].map((referral, index) => (
            <Card key={index} {...referral} />
          ))}
        </div>
        <div className="pointer-events-none absolute inset-y-0 left-0 w-[140px] bg-gradient-to-r from-white to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-[140px] bg-gradient-to-l from-white to-transparent" />
      </div>
      <style>{`@keyframes referrals-crawl { from { transform: translateX(0); } to { transform: translateX(-${LOOP_WIDTH}px); } }`}</style>
    </section>
  );
}
