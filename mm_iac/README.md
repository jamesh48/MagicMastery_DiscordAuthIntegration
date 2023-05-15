# Magic Mastery Auth Infrastructure as Code

### AWS

- To deploy you will at least need npm, aws-cdk and aws cli globally installed.

  - once that is done you can run
  - `aws configure --profile ProductionAccount`, you will be prompted to provide an `AWS Access Key ID`, a `AWS Secret Access Key`, a `Default region name` and a `Default output format`

  - For `AWS Access Key ID` and `AWS Secret Access Key` you can always ask James for these, but if hes not available they can be found in this way...
  - The `AWS Access Key ID` can be found in AWS following the top righthand most drop down > Security Credentials > AccessKeys.
  - For `AWS Secret Access Key` you have to create a new Access Key and save the generated value in a safe place, note that only two can be stored at a time.

  - For `Default region name` and `Default output format` just press enter.

- There is currently no CI/CD pipeline for this application, to deploy run `npm run deploy:local:prd` while in mm_iac folder- you might have to change the npm script in package.json to point to the default profile or a different aws profile if you have it deployed differently. On my machine, the aws profile in ~/.aws/credentials is called `ProductionAccount`.

- Note that some of the logic in constructs/mmApplicationLoadBalancedFargateService.ts is borrowed from another repo and not all of it makes sense for this use case.
