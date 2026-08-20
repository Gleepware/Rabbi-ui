"use client";

import ContentPanel from "../components/content-panel";
import Navbar from "../components/navbar";
import ReaderPage from "../components/reader-page";
import Questions from "../components/questions/conversations";
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
  "Questions": Questions,
  "About Rabbi": Placeholder,
  "Exit": Placeholder
}

const menuActivities = Object.keys(activities).filter(v => v != "Reader")

export default function Home() {
  const { activity, setActivity } = useReaderContext();
  const ActiveComponent = activities[activity] ?? Error;

  const switchActivity = (newActivity) => {
    setActivity(newActivity)
  }

  const handleCloseEvent = () => {
    if (activity !== "Reader") setActivity("Reader")
  }


  return (
    <>
      <Navbar options={menuActivities} onSelect={(item) => switchActivity(item)} />
      <ContentPanel>
        <ActiveComponent onClose={() => handleCloseEvent()}/>
      </ContentPanel>
    </>
  );
}
