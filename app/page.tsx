export default function Home() {
  const year = new Date().getFullYear();

  return (
    <div className="container">
      <header className="hero">
        <h1>Tia</h1>
        <p className="tagline">
          a freshman at UH Manoa studying entrepreneurship.
        </p>
      </header>

      <main>
        <section>
          <h2>About</h2>
          <p>
            I&apos;m a freshman at UH Manoa studying entrepreneurship. I&apos;m
            interested in how ideas turn into real businesses, and I&apos;m using
            my first year to learn the fundamentals and figure out where I want
            to focus.
          </p>
        </section>

        <section>
          <h2>This semester</h2>
          <ul>
            <li>
              I&apos;m taking an introductory entrepreneurship course and
              learning how to evaluate and test new ideas.
            </li>
            <li>
              I&apos;m exploring a small business idea and talking with people
              to see whether it solves a real problem.
            </li>
            <li>
              I&apos;m getting involved on campus at UH Manoa and meeting other
              students who are interested in starting things.
            </li>
          </ul>
        </section>
      </main>

      <footer>
        <p>&copy; {year} Tia</p>
      </footer>
    </div>
  );
}
