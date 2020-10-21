# Nodemailer express api example
Rename config.env.example to config.env a set the variables accordingly

## Endpoints

### POST /login
Used to get an jwt token, the token will expire after 2h
``` 
{
    "pass": "password"
} 
```

### POST /mail
```
{
    "to": ["string list of recipients"],
    "subject": "email subject",
    "body": "email body with html formatting",
    "attachments": [{
                "filename": "filename (extension is used for mime type)",
                "content": "file in base64"
    }]
}
```