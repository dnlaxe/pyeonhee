import { Button, Container } from "../../shared";

export function NotFound() {
  return (
    <main>
      <section className="py-20 max-md:py-14">
        <Container narrow extraClass="text-center">
          <p className="heading-404 m-0 mb-3">404</p>
          <h1 className="heading-page m-0 mb-8">Page not found</h1>
          <div className="flex flex-wrap justify-center gap-3">
            <Button to="/?kind=job" variant="secondary">
              Work
            </Button>
            <Button to="/?kind=market" variant="secondary">
              For Sale
            </Button>
            <Button to="/?kind=service" variant="secondary">
              Services
            </Button>
          </div>
        </Container>
      </section>
    </main>
  );
}
