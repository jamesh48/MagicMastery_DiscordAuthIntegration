# Magic Mastery Auth Infrastructure as Code

- There is currently no CI/CD pipeline for this application, to deploy run `npm run deploy:local:prd` while in mm_iac folder- you might have to change the npm script in package.json to point to the default profile or a different aws profile if you have it deployed differently. On my machine, the aws profile in ~/.aws/credentials is called `ProductionAccount`.
