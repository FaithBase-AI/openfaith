import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_marketing/vision')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div className='flex flex-col items-start gap-10 pt-8 pb-4'>
      <h1 className='font-bold text-6xl'>Vision</h1>

      <p className='text-2xl text-gray-600 dark:text-gray-300'>
        {/* Their are three different problems that I see with church software as a whole that I have
        set out to solve with OpenFaith.
        <br />
        1. Enable churches to spend more time on mission.
        <br />
        2. Make it really easy for others to build software for churches
        <br />
        3. Help churches focus on discipleship
        <br />
        <br /> */}
        Church software has been stuck in the dark ages. For a long time, the church has gotten the
        sloppy seconds from the world. Silicon Valley isn't building software for believers because
        they are at war with the Kingdom. I'm so grateful for those who have served the church,
        built tools for them, and served the bride. The problem is technology moves forward at a
        break neck pace. What was hot 5 years ago feels dated today. Churches have had their data
        held captive in old systems without a path forward. Data has been scattered in different
        products that don't sync with one another.
        <br />
        <br />
        The burden of administration for churches continues to grow. Managing Services, Teams,
        Groups, Donations, Kids Check-ins, People, Connect Cards, Classes, Conferences. It's like a
        new thing is added every couple of years, more new processes, more time spent managing data
        instead of discipling people.
        <br />
        <br />
        I've been building software for the church since 2019. I've seen the ups and downs, the
        problems that need solving. How churches have been held hostage by giving solutions, stuck
        on archaic databases with no path forward. It breaks my heart. The Lord started to speak to
        me in the spring of 2025 about building something new with all the knowledge I've gained
        from the last 6 years.
        <br />
        <br />
        He showed me a way of building a general tool that can talk to all the church software that
        has come before. This gives churches a path into modern software without the switching
        costs. You can still use your old software and use OpenFaith at the same time. All of your
        systems will stay in sync thanks to OpenFaiths powerful sync engine.
        <br />
        <br />
        OpenFaith is the fastest church software you have ever used. No more refreshing to see
        changes, everything is instant. 1 click to edit anything. Look at your data more like a
        spreadsheet than a list. Customize the columns you want to see for every data type. Filter
        instantly and save it as a view to share them with your team. View your church the way you
        want to see it.
        <br />
        <br />
        The other part of church software that has just confused me to no end is how they deny the
        foundations of ministry by excluding core features. If your church software doesn't let you
        mark that someone is saved, it's not church software. If it doesn't let you have a
        membership class that lets you gate what people can and can't do, it's not church software.
        <br />
        <br />
        The reality is, we have software for administration, but not software for discipleship.
        Jesus said that his house (church) will be known as a house of prayer. We have tools that
        let us put on a show each weekend, but cause us to miss the lost sheep. In our pursuit of
        excellence, we have lost the heart of ministry in our tools. I truly believe that we need a
        new wineskin of software to support the coming move of the Spirit that will bring revival to
        America and the ends of the earth.
        <br />
        <br />
        Increasing giving, helping plan services, enabling faster kids check-in are the money
        makers. I don't have a problem with this at face value. Our tools have turned us into
        pharisees. It's caused us to focus on the what over the who. My prayer with OpenFaith is to
        bring us back to the who, the people, the sheep, the lost souls.
      </p>
    </div>
  )
}
