export default (
  discordId: string,
  baseUrl: string,
  defaultChannelID: string
) => `
  <!DOCTYPE html>
  <html>
  <head>
    <title>Magic Master Auth</title>
    <style>
      html,
      body {
        height: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
        margin: 0;
        background-color: #1a1a1a;
      }

      #root {
        width: 100%;
        max-width: 20rem;
      }

      form {
        background-color: #222;
        padding: 2rem;
        border-radius: 8px;
        display: flex;
        flex-direction: column;
        align-items: center;
      }

      h2 {
        text-decoration: underline;
      }

      h2, h3 {
        color: #fff;
        text-align: center;
        margin-bottom: 1rem;
        margin-top: 0;
      }

      input[type="email"] {
        width: 100%;
        padding: 0.5rem;
        border-radius: 4px;
        border: none;
        outline: none;
      }

      input[type="text"]::placeholder {
        color: lightgrey;
      }

      button[type="submit"] {
        background-color: #4caf50;
        color: #fff;
        padding: 0.5rem 1rem;
        border-radius: 4px;
        border: none;
        cursor: pointer;
        margin-top: 0.5rem;
        width: 90%;
      }

      button[type="submit"]:hover {
        background-color: #45a049;
      }

      .status-message {
        color: #fff;
        margin-top: 0.5rem;
        font-size: 0.9rem;
      }

      .status-success {
        color: #4caf50;
      }

      .status-error {
        color: #f44336;
      }

      @media only screen and (max-width: 480px) {
        form {
          max-width: 90%;
        }
      }
    </style>
    <script src="https://cdn.jsdelivr.net/npm/axios/dist/axios.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/react/umd/react.development.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/react-dom/umd/react-dom.development.js"></script>
    <script src="https://unpkg.com/babel-standalone@6/babel.min.js"></script>
  </head>
  <body>
    <div id="root"></div>
    <script type="text/babel">
      const { useState } = React;

      const Form = () => {
        const [email, setEmail] = useState('');
        const [statusMessage, setStatusMessage] = useState('');

        const submitForm = async (event) => {
          event.preventDefault(); // Prevent form submission
          try {
            const response = await axios.post("${baseUrl}/acmpActivate", {
              discordId: "${discordId}",
              email
            });

            if (response.status === 200) {
              setStatusMessage('Email submitted successfully!');
              window.location.replace('https://discord.com/channels/${defaultChannelID}');
            } else {
              setStatusMessage('Email submission failed.');
            }
          } catch (error) {
            console.error(error);
            setStatusMessage('An error occurred while submitting the email.');
          }
        };

        return (
          <form onSubmit={submitForm}>
            <h2>Magic Mastery</h2>
            <h3>Member Discord Registration</h3>
            <input
              type="email"
              placeholder="Please enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <button type="submit">Submit</button>
            <div className={\`status-message \${statusMessage ? (statusMessage.includes('success') ? 'status-success' : 'status-error') : ''}\`}>
              {statusMessage}
            </div>
          </form>
        );
      };

      ReactDOM.render(<Form />, document.getElementById('root'));
    </script>
  </body>
`;
