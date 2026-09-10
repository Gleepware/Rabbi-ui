"use client";

import { useRef } from "react";
import ContentPanel from "../components/content-panel";
import Navbar from "../components/navbar";
import ReaderPage from "../components/reader-page";
import Conversations from "../components/questions/conversations";
import Settings from "../components/settings";
import AboutPanel from "../components/about/about-panel";
import { useReaderContext } from "../contexts/AppContext";

const Error = () => {
  return <>
    Unexpected error.
  </>
}

const activities = {
  "Reader": ReaderPage,
  "Conversation": Conversations,
  "Settings": Settings,
  "About Rabbi": AboutPanel
}

const menuActivities = [
  { key: "Settings", label: "Settings" },
  { key: "About Rabbi", label: "About Rabbi" },
]

export default function Home() {
  const { activity, setActivity, hydrated } = useReaderContext();
  const previousActivity = useRef("Reader");
  const ActiveComponent = activities[activity] ?? Error;

  const onActivitySwitch = (newActivity) => {
    if (newActivity === "Settings") {
      previousActivity.current = activity;
    }
    setActivity(newActivity);
  }

  const onActiveComponentClose = () => {
    setActivity(previousActivity.current);
  }

  return (
    <>
      <Navbar options={menuActivities} onSelect={(item) => onActivitySwitch(item)} />
      <ContentPanel>
        {hydrated ? <ActiveComponent onClose={() => onActiveComponentClose()} /> : null}
      </ContentPanel>
    </>
  );
}
