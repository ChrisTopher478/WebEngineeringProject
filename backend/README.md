If docker can not start it might be the virtualization support being disabled:

To enable (taking effect on pc restart)
```cmd
bcdedit /set hypervisorlaunchtype auto
```

To disable (taking effect on pc restart)
```cmd
bcdedit /set hypervisorlaunchtype off
```