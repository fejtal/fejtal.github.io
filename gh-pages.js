var ghpages = require('gh-pages');

ghpages.publish(
    'public', // path to public directory
    {
        branch: 'gh-pages',
        repo: 'https://github.com/fejtal/fejtal.github.io.git', // Update to point to your repository  
        user: {
            name: 'fejtal', // update to use your name
            email: 'kratosx561@gmail.com' // Update to use your email
        }
    },
    () => {
        console.log('Deploy Complete!')
    }
)