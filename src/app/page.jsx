"use client";

import { useRef } from "react";
import ContentPanel from "../components/content-panel";
import Navbar from "../components/navbar";
import ReaderPage from "../components/reader-page";
import Conversation from "../components/questions/conversations";
import Settings from "../components/settings";
import { useReaderContext } from "../contexts/AppContext";

const Error = () => {
  return <>
    Unexpected error.
  </>
}

const Placeholder = () => {
  return <>
    Under Construction
  </>
}

const activities = {
  "Reader": ReaderPage,
  "Conversation": Conversation,
  "Settings": Settings,
  "About Rabbi": Placeholder
}

const menuActivities = [
  { key: "Settings", label: "Settings" },
  { key: "About Rabbi", label: "About Rabbi" },
  { key: "Exit", label: "Exit" }
]

export default function Home() {
  const { activity, setActivity, hydrated } = useReaderContext();
  const previousActivity = useRef("Reader");
  const ActiveComponent = activities[activity] ?? Error;

  const switchActivity = (newActivity) => {
    if (newActivity === "Settings") {
      previousActivity.current = activity;
    }
    setActivity(newActivity)
  }

  const onActiveComponentClose = () => {
    setActivity(previousActivity.current)
  }


  return (
    <>
      <Navbar options={menuActivities} onSelect={(item) => switchActivity(item)} />
      <ContentPanel>
        {hydrated ? <ActiveComponent onClose={() => onActiveComponentClose()} /> : null}
      </ContentPanel>
    </>
  );
}
